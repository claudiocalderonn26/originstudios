create extension if not exists "pgcrypto";

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  slug text not null unique,
  name text not null,
  description text,
  price_crc integer not null check (price_crc >= 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  drop_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 1,
  created_at timestamptz not null default now(),
  unique(product_id, size)
);

create table public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  province text not null,
  canton text,
  district text,
  price_crc integer,
  requires_manual_quote boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  verification_token text not null,
  customer_name text not null,
  id_number text not null,
  phone text not null,
  email text,
  province text not null,
  canton text not null,
  district text not null,
  address text not null,
  notes text,
  subtotal_crc integer not null check (subtotal_crc >= 0),
  shipping_crc integer,
  shipping_status text not null default 'pendiente_cotizacion',
  total_crc integer not null check (total_crc >= 0),
  payment_method text not null check (payment_method in ('sinpe', 'bac')),
  payment_reference text,
  payment_status text not null default 'pendiente' check (payment_status in ('pendiente', 'en_verificacion', 'pagado', 'rechazado')),
  fulfillment_status text not null default 'recibido' check (fulfillment_status in ('recibido', 'en_preparacion', 'empacado', 'enviado', 'entregado', 'cancelado')),
  tracking_number text,
  reservation_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid not null references public.product_variants(id),
  product_name text not null,
  brand_name text not null,
  size text not null,
  quantity integer not null check (quantity > 0),
  unit_price_crc integer not null check (unit_price_crc >= 0),
  line_total_crc integer not null check (line_total_crc >= 0)
);

create table public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  file_url text not null,
  created_at timestamptz not null default now()
);

alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.store_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_proofs enable row level security;

create policy "Public can read active brands" on public.brands for select using (true);
create policy "Public can read categories" on public.categories for select using (true);
create policy "Public can read active products" on public.products for select using (is_active = true);
create policy "Public can read product images" on public.product_images for select using (true);
create policy "Public can read variant availability only" on public.product_variants for select using (true);
create policy "Public can read active shipping rates" on public.shipping_rates for select using (is_active = true);
create policy "Public can read safe store settings" on public.store_settings for select using (key in ('public_profile', 'payment_sinpe'));

create or replace function public.next_order_number()
returns text
language plpgsql
security definer
as $$
declare
  seq integer;
begin
  select count(*) + 1 into seq from public.orders where created_at >= date_trunc('year', now());
  return 'OS-' || to_char(now(), 'YYYY') || '-' || lpad(seq::text, 4, '0');
end;
$$;

create or replace function public.create_store_order(order_payload jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  new_order_id uuid;
  item jsonb;
  variant_row record;
  product_row record;
  subtotal integer := 0;
  order_no text := public.next_order_number();
  token text := encode(gen_random_bytes(18), 'hex');
  qty integer;
begin
  if jsonb_array_length(order_payload->'items') = 0 then
    raise exception 'El carrito está vacío.';
  end if;

  for item in select * from jsonb_array_elements(order_payload->'items') loop
    qty := (item->>'quantity')::integer;

    select pv.*, p.id as product_id, p.name as product_name, p.price_crc, b.name as brand_name
      into product_row
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    left join public.brands b on b.id = p.brand_id
    where pv.id = (item->>'variantId')::uuid
    for update;

    if product_row.id is null or product_row.stock < qty then
      raise exception 'Una talla seleccionada ya no está disponible.';
    end if;

    subtotal := subtotal + (product_row.price_crc * qty);
  end loop;

  insert into public.orders (
    order_number, verification_token, customer_name, id_number, phone, email,
    province, canton, district, address, notes, subtotal_crc, shipping_crc,
    total_crc, payment_method, payment_reference, reservation_expires_at
  )
  values (
    order_no, token,
    order_payload #>> '{customer,full_name}',
    order_payload #>> '{customer,id_number}',
    order_payload #>> '{customer,phone}',
    nullif(order_payload #>> '{customer,email}', ''),
    order_payload #>> '{customer,province}',
    order_payload #>> '{customer,canton}',
    order_payload #>> '{customer,district}',
    order_payload #>> '{customer,address}',
    nullif(order_payload #>> '{customer,notes}', ''),
    subtotal, null, subtotal,
    order_payload->>'paymentMethod',
    nullif(order_payload #>> '{customer,payment_reference}', ''),
    now() + interval '24 hours'
  )
  returning id into new_order_id;

  for item in select * from jsonb_array_elements(order_payload->'items') loop
    qty := (item->>'quantity')::integer;

    select pv.*, p.id as product_id, p.name as product_name, p.price_crc, b.name as brand_name
      into variant_row
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    left join public.brands b on b.id = p.brand_id
    where pv.id = (item->>'variantId')::uuid
    for update;

    update public.product_variants set stock = stock - qty where id = variant_row.id;

    insert into public.order_items (
      order_id, product_id, variant_id, product_name, brand_name, size, quantity, unit_price_crc, line_total_crc
    ) values (
      new_order_id, variant_row.product_id, variant_row.id, variant_row.product_name,
      coalesce(variant_row.brand_name, 'Origin Studios'), variant_row.size, qty,
      variant_row.price_crc, variant_row.price_crc * qty
    );
  end loop;

  return jsonb_build_object('orderNumber', order_no, 'verificationToken', token, 'total', subtotal);
end;
$$;

insert into public.brands (name, slug) values
  ('Nude Project', 'nude-project'),
  ('Scuffers', 'scuffers'),
  ('EME Studios', 'eme-studios'),
  ('Origin Studios', 'origin-studios')
on conflict do nothing;

insert into public.categories (name, slug) values
  ('Camisetas', 'camisetas'),
  ('Hoodies', 'hoodies'),
  ('Gorras', 'gorras'),
  ('Tenis', 'tenis'),
  ('Accesorios', 'accesorios')
on conflict do nothing;

insert into public.store_settings (key, value) values
  ('payment_sinpe', '{"phone":"8603-7873","instructions":"Incluye tu número de orden en el detalle del SINPE."}'),
  ('public_profile', '{"instagram":"@originstudios.cr","location":"San José, Costa Rica"}'),
  ('payment_bac', '{"bank":"BAC","account_holder":"","account_number":"","iban":""}')
on conflict (key) do update set value = excluded.value;
