begin;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('sinpe', 'bac', 'efectivo', 'contra_entrega'));
alter table public.orders add column if not exists checkout_request_id uuid unique;

create sequence if not exists public.store_order_sequence;
-- Preserve existing order numbers; never reset the sequence backwards on rerun.
select setval('public.store_order_sequence', greatest(
  (select last_value from public.store_order_sequence),
  coalesce((select max(substring(order_number from '[0-9]+$')::bigint) from public.orders), 0) + 1
), false);

create or replace function public.next_order_number()
returns text language sql security definer set search_path = '' as $$
  select 'OS-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.store_order_sequence')::text, 6, '0');
$$;

create or replace function public.create_store_order(order_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  new_order_id uuid;
  request_id uuid := (order_payload->>'requestId')::uuid;
  previous public.orders%rowtype;
  entry record;
  product_row record;
  subtotal integer := 0;
  order_no text;
  token text := replace(gen_random_uuid()::text, '-', '');
  payment text := order_payload->>'paymentMethod';
begin
  if request_id is null then raise exception 'Actualiza la página antes de generar la orden.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(request_id::text, 0));
  select * into previous from public.orders where checkout_request_id = request_id;
  if found then
    return jsonb_build_object('orderNumber', previous.order_number, 'verificationToken', previous.verification_token,
      'total', previous.total_crc, 'paymentMethod', previous.payment_method, 'shippingStatus', previous.shipping_status, 'replayed', true);
  end if;
  if payment is null or payment not in ('sinpe', 'bac', 'efectivo', 'contra_entrega') then raise exception 'Selecciona un método de pago válido.'; end if;
  if jsonb_typeof(order_payload->'items') is distinct from 'array' then raise exception 'El carrito no es válido.'; end if;
  if jsonb_array_length(order_payload->'items') not between 1 and 100 then raise exception 'Revisa las prendas del carrito.'; end if;
  if exists (select 1 from jsonb_array_elements(order_payload->'items') i
    where coalesce((i->>'quantity')::numeric, 0) not between 1 and 99
       or (i->>'quantity')::numeric <> trunc((i->>'quantity')::numeric)
       or i->>'variantId' is null) then raise exception 'Revisa las cantidades del carrito.'; end if;

  -- Consistent lock order prevents deadlocks. Lock only the non-null joined rows.
  for entry in select (i->>'variantId')::uuid as variant_id, sum((i->>'quantity')::integer)::integer as qty
    from jsonb_array_elements(order_payload->'items') i group by 1 order by 1 loop
    select pv.id, pv.stock, p.price_crc, p.is_active into product_row
      from public.product_variants pv join public.products p on p.id = pv.product_id
      where pv.id = entry.variant_id for update of pv, p;
    if not found or not product_row.is_active then raise exception 'Una prenda ya no está disponible.'; end if;
    if product_row.stock < entry.qty then raise exception 'Una talla no tiene suficientes unidades. Ajusta tu carrito.'; end if;
    if product_row.price_crc <= 0 then raise exception 'Una prenda aún no tiene precio confirmado.'; end if;
    subtotal := subtotal + product_row.price_crc * entry.qty;
  end loop;

  order_no := public.next_order_number();
  insert into public.orders (
    checkout_request_id, order_number, verification_token, customer_name, id_number, phone, email,
    province, canton, district, address, notes, subtotal_crc, shipping_crc, total_crc,
    payment_method, payment_reference, reservation_expires_at
  ) values (
    request_id, order_no, token, order_payload #>> '{customer,full_name}', order_payload #>> '{customer,id_number}',
    order_payload #>> '{customer,phone}', order_payload #>> '{customer,email}',
    order_payload #>> '{customer,province}', order_payload #>> '{customer,canton}', order_payload #>> '{customer,district}',
    order_payload #>> '{customer,address}', nullif(order_payload #>> '{customer,notes}', ''), subtotal, null, subtotal,
    payment, nullif(order_payload #>> '{customer,payment_reference}', ''),
    case when payment in ('sinpe', 'bac') then now() + interval '24 hours' else null end
  ) returning id into new_order_id;

  for entry in select (i->>'variantId')::uuid as variant_id, sum((i->>'quantity')::integer)::integer as qty
    from jsonb_array_elements(order_payload->'items') i group by 1 order by 1 loop
    select pv.*, p.name as product_name, p.price_crc, b.name as brand_name into product_row
      from public.product_variants pv join public.products p on p.id = pv.product_id
      left join public.brands b on b.id = p.brand_id where pv.id = entry.variant_id;
    update public.product_variants set stock = stock - entry.qty where id = entry.variant_id;
    insert into public.order_items (order_id, product_id, variant_id, product_name, brand_name, size, quantity, unit_price_crc, line_total_crc)
      values (new_order_id, product_row.product_id, entry.variant_id, product_row.product_name,
        coalesce(product_row.brand_name, 'Origin Studios'), product_row.size, entry.qty, product_row.price_crc, product_row.price_crc * entry.qty);
  end loop;
  return jsonb_build_object('orderNumber', order_no, 'verificationToken', token, 'total', subtotal,
    'paymentMethod', payment, 'shippingStatus', 'pendiente_cotizacion', 'replayed', false);
end;
$$;

-- All checkout validation goes through the server, never an anonymous direct RPC.
revoke all on function public.create_store_order(jsonb) from public, anon, authenticated;
grant execute on function public.create_store_order(jsonb) to service_role;
revoke all on function public.next_order_number() from public, anon, authenticated;
grant execute on function public.next_order_number() to service_role;
revoke all on function public.seed_origin_product(text,text,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.seed_origin_product(text,text,text,text,text,jsonb) to service_role;

commit;
