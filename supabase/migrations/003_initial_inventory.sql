create or replace function public.seed_origin_product(
  p_brand text,
  p_category text,
  p_name text,
  p_color text,
  p_slug text,
  p_stock jsonb
)
returns void
language plpgsql
as $$
declare
  v_brand_id uuid;
  v_category_id uuid;
  v_product_id uuid;
  v_size text;
  v_stock integer;
begin
  insert into public.brands (name, slug)
  values (p_brand, lower(regexp_replace(p_brand, '[^a-zA-Z0-9]+', '-', 'g')))
  on conflict (slug) do update set name = excluded.name
  returning id into v_brand_id;

  insert into public.categories (name, slug)
  values (p_category, lower(regexp_replace(p_category, '[^a-zA-Z0-9]+', '-', 'g')))
  on conflict (slug) do update set name = excluded.name
  returning id into v_category_id;

  insert into public.products (brand_id, category_id, slug, name, description, price_crc, is_active, is_featured)
  values (
    v_brand_id,
    v_category_id,
    p_slug,
    p_name || ' - ' || p_color,
    'Inventario inicial Origin Studios. Color: ' || p_color || '. Precio e imagen pendientes de configurar.',
    0,
    true,
    false
  )
  on conflict (slug) do update set
    brand_id = excluded.brand_id,
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    updated_at = now()
  returning id into v_product_id;

  for v_size, v_stock in select key, value::integer from jsonb_each_text(p_stock)
  loop
    insert into public.product_variants (product_id, size, stock)
    values (v_product_id, v_size, v_stock)
    on conflict (product_id, size) do update set stock = excluded.stock;
  end loop;
end;
$$;

select public.seed_origin_product('Nude Project', 'Hoodies', 'Hoodie Turquoise Graphic', 'Negro', 'nude-project-hoodie-turquoise-graphic-negro', '{"M":1,"L":1}');
select public.seed_origin_product('Nude Project', 'Hoodies', 'Hoodie Cherries', 'Crema', 'nude-project-hoodie-cherries-crema', '{"M":1,"L":1}');
select public.seed_origin_product('Nude Project', 'Hoodies', 'Hoodie Cherries', 'Negro', 'nude-project-hoodie-cherries-negro', '{"M":1,"L":1}');
select public.seed_origin_product('Scuffers', 'Hoodies', 'Hoodie With Love', 'Negro', 'scuffers-hoodie-with-love-negro', '{"S":1,"M":1}');
select public.seed_origin_product('Nude Project', 'Camisetas', 'Camiseta Apple Graphic', 'Negro', 'nude-project-camiseta-apple-graphic-negro', '{"S":1,"M":1,"L":1}');
select public.seed_origin_product('Nude Project', 'Camisetas', 'Camiseta Amor de Verano', 'Blanco', 'nude-project-camiseta-amor-de-verano-blanco', '{"L":1}');
select public.seed_origin_product('Scuffers', 'Camisetas', 'Camiseta Oranges', 'Azul marino', 'scuffers-camiseta-oranges-azul-marino', '{"L":1}');
select public.seed_origin_product('Nude Project', 'Camisetas', 'Camiseta Sophisticated Pleasure', 'Negro', 'nude-project-camiseta-sophisticated-pleasure-negro', '{"M":1,"L":2}');
select public.seed_origin_product('Nude Project', 'Camisetas', 'Camiseta By Artists for Artists', 'Rosado', 'nude-project-camiseta-by-artists-for-artists-rosado', '{"S":1}');
select public.seed_origin_product('Scuffers', 'Camisetas', 'Camiseta Not Ibiza Yet', 'Blanco', 'scuffers-camiseta-not-ibiza-yet-blanco', '{"M":1,"L":1}');
select public.seed_origin_product('Scuffers', 'Camisetas', 'Camiseta Purple Sun', 'Blanco', 'scuffers-camiseta-purple-sun-blanco', '{"M":1,"L":2}');
select public.seed_origin_product('Scuffers', 'Camisetas', 'Camiseta Gradient Logo', 'Blanco', 'scuffers-camiseta-gradient-logo-blanco', '{"S":1,"M":1,"L":2}');
select public.seed_origin_product('EME Studios', 'Camisetas', 'Camiseta Collage', 'Blanco', 'eme-studios-camiseta-collage-blanco', '{"M":1,"L":2}');
select public.seed_origin_product('Scuffers', 'Camisetas', 'Camiseta Cherries', 'Crema', 'scuffers-camiseta-cherries-crema', '{"S":1,"M":1,"L":2}');
select public.seed_origin_product('Nude Project', 'Camisetas', 'Camiseta Ibiza Cocktail', 'Blanco', 'nude-project-camiseta-ibiza-cocktail-blanco', '{"S":1,"M":1,"L":1}');
select public.seed_origin_product('Nude Project', 'Camisetas', 'Camiseta Winners Club', 'Blanco', 'nude-project-camiseta-winners-club-blanco', '{"M":1,"L":1}');
select public.seed_origin_product('Nude Project', 'Camisetas', 'Camiseta Winners Club', 'Gris', 'nude-project-camiseta-winners-club-gris', '{"M":1,"L":1}');
select public.seed_origin_product('Nude Project', 'Camisetas', 'Camiseta Community Over Ego', 'Azul marino', 'nude-project-camiseta-community-over-ego-azul-marino', '{"S":1,"L":1}');
select public.seed_origin_product('EME Studios', 'Camisetas', 'Camiseta Collage', 'Negro', 'eme-studios-camiseta-collage-negro', '{"M":2,"L":2}');
select public.seed_origin_product('Nude Project', 'Camisetas', 'Camiseta Airplane Mode Faces', 'Negro', 'nude-project-camiseta-airplane-mode-faces-negro', '{"S":1,"M":1,"L":2}');
select public.seed_origin_product('Scuffers', 'Camisetas', 'Camiseta Studios Turquoise', 'Azul marino', 'scuffers-camiseta-studios-turquoise-azul-marino', '{"L":1}');
select public.seed_origin_product('Scuffers', 'Camisetas', 'Camiseta With Love', 'Azul marino', 'scuffers-camiseta-with-love-azul-marino', '{"M":1,"L":2,"XL":1}');
select public.seed_origin_product('Scuffers', 'Camisetas', 'Camiseta Gradient Logo', 'Cafe oscuro', 'scuffers-camiseta-gradient-logo-cafe-oscuro', '{"M":1,"L":1}');
select public.seed_origin_product('Broken Planet', 'Camisetas', 'Camiseta Rolling Loud', 'Negro', 'broken-planet-camiseta-rolling-loud-negro', '{"L":1}');
select public.seed_origin_product('Broken Planet', 'Hoodies', 'Hoodie Hearts Are Made to Be Broken', 'Negro', 'broken-planet-hoodie-hearts-are-made-to-be-broken-negro', '{"L":1}');
select public.seed_origin_product('Stussy', 'Camisetas', 'Camiseta Flower', 'Negro', 'stussy-camiseta-flower-negro', '{"M":1,"L":1}');
select public.seed_origin_product('Stussy', 'Camisetas', 'Camiseta Flower', 'Blanco', 'stussy-camiseta-flower-blanco', '{"M":1,"L":1}');
select public.seed_origin_product('Broken Planet', 'Hoodies', 'Hoodie Planet Graphic', 'Negro', 'broken-planet-hoodie-planet-graphic-negro', '{"M":1}');
select public.seed_origin_product('Broken Planet', 'Camisetas', 'Camiseta Butterfly Graphic', 'Negro', 'broken-planet-camiseta-butterfly-graphic-negro', '{"M":1,"L":1}');
select public.seed_origin_product('Broken Planet', 'Camisetas', 'Camiseta Butterfly Graphic', 'Blanco', 'broken-planet-camiseta-butterfly-graphic-blanco', '{"M":1,"L":1}');
select public.seed_origin_product('Broken Planet', 'Hoodies', 'Hoodie Into the Abyss', 'Azul oscuro', 'broken-planet-hoodie-into-the-abyss-azul-oscuro', '{"M":1,"L":2}');
select public.seed_origin_product('Casablanca', 'Camisetas', 'Camiseta Graphic', 'Blanco', 'casablanca-camiseta-graphic-blanco', '{"M":1,"L":1}');
select public.seed_origin_product('Broken Planet', 'Camisetas', 'Camiseta Speed of Light', 'Negro', 'broken-planet-camiseta-speed-of-light-negro', '{"M":1,"L":1}');

update public.products set price_crc = case slug
  when 'nude-project-hoodie-turquoise-graphic-negro' then 49900
  when 'nude-project-hoodie-cherries-crema' then 48900
  when 'nude-project-hoodie-cherries-negro' then 48900
  when 'scuffers-hoodie-with-love-negro' then 46900
  when 'nude-project-camiseta-apple-graphic-negro' then 32900
  when 'nude-project-camiseta-amor-de-verano-blanco' then 31900
  when 'scuffers-camiseta-oranges-azul-marino' then 31900
  when 'nude-project-camiseta-sophisticated-pleasure-negro' then 34900
  when 'nude-project-camiseta-by-artists-for-artists-rosado' then 32900
  when 'scuffers-camiseta-not-ibiza-yet-blanco' then 31900
  when 'scuffers-camiseta-purple-sun-blanco' then 32900
  when 'scuffers-camiseta-gradient-logo-blanco' then 31900
  when 'eme-studios-camiseta-collage-blanco' then 33900
  when 'scuffers-camiseta-cherries-crema' then 32900
  when 'nude-project-camiseta-ibiza-cocktail-blanco' then 33900
  when 'nude-project-camiseta-winners-club-blanco' then 32900
  when 'nude-project-camiseta-winners-club-gris' then 32900
  when 'nude-project-camiseta-community-over-ego-azul-marino' then 31900
  when 'eme-studios-camiseta-collage-negro' then 33900
  when 'nude-project-camiseta-airplane-mode-faces-negro' then 34900
  when 'scuffers-camiseta-studios-turquoise-azul-marino' then 31900
  when 'scuffers-camiseta-with-love-azul-marino' then 32900
  when 'scuffers-camiseta-gradient-logo-cafe-oscuro' then 31900
  when 'broken-planet-camiseta-rolling-loud-negro' then 35900
  when 'broken-planet-hoodie-hearts-are-made-to-be-broken-negro' then 51900
  when 'stussy-camiseta-flower-negro' then 35900
  when 'stussy-camiseta-flower-blanco' then 35900
  when 'broken-planet-hoodie-planet-graphic-negro' then 44900
  when 'broken-planet-camiseta-butterfly-graphic-negro' then 34900
  when 'broken-planet-camiseta-butterfly-graphic-blanco' then 34900
  when 'broken-planet-hoodie-into-the-abyss-azul-oscuro' then 51900
  when 'casablanca-camiseta-graphic-blanco' then 35900
  when 'broken-planet-camiseta-speed-of-light-negro' then 34900
  else price_crc
end
where slug in (
  'nude-project-hoodie-turquoise-graphic-negro',
  'nude-project-hoodie-cherries-crema',
  'nude-project-hoodie-cherries-negro',
  'scuffers-hoodie-with-love-negro',
  'nude-project-camiseta-apple-graphic-negro',
  'nude-project-camiseta-amor-de-verano-blanco',
  'scuffers-camiseta-oranges-azul-marino',
  'nude-project-camiseta-sophisticated-pleasure-negro',
  'nude-project-camiseta-by-artists-for-artists-rosado',
  'scuffers-camiseta-not-ibiza-yet-blanco',
  'scuffers-camiseta-purple-sun-blanco',
  'scuffers-camiseta-gradient-logo-blanco',
  'eme-studios-camiseta-collage-blanco',
  'scuffers-camiseta-cherries-crema',
  'nude-project-camiseta-ibiza-cocktail-blanco',
  'nude-project-camiseta-winners-club-blanco',
  'nude-project-camiseta-winners-club-gris',
  'nude-project-camiseta-community-over-ego-azul-marino',
  'eme-studios-camiseta-collage-negro',
  'nude-project-camiseta-airplane-mode-faces-negro',
  'scuffers-camiseta-studios-turquoise-azul-marino',
  'scuffers-camiseta-with-love-azul-marino',
  'scuffers-camiseta-gradient-logo-cafe-oscuro',
  'broken-planet-camiseta-rolling-loud-negro',
  'broken-planet-hoodie-hearts-are-made-to-be-broken-negro',
  'stussy-camiseta-flower-negro',
  'stussy-camiseta-flower-blanco',
  'broken-planet-hoodie-planet-graphic-negro',
  'broken-planet-camiseta-butterfly-graphic-negro',
  'broken-planet-camiseta-butterfly-graphic-blanco',
  'broken-planet-hoodie-into-the-abyss-azul-oscuro',
  'casablanca-camiseta-graphic-blanco',
  'broken-planet-camiseta-speed-of-light-negro'
);
