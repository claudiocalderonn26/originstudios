import { NextResponse } from "next/server";
import { z } from "zod";
import { adminSupabase } from "@/lib/supabase";

const variantSchema = z.object({
  size: z.string().min(1),
  stock: z.number().int().nonnegative()
});

const schema = z.object({
  brand: z.string().min(2),
  category: z.string().min(2),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().nullable(),
  price_crc: z.number().int().nonnegative(),
  image_url: z.string().url().optional().or(z.literal("")),
  variants: z.array(variantSchema)
});

const patchSchema = schema.extend({
  id: z.string().uuid(),
  is_active: z.boolean().optional()
});

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  const supabase = adminSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, slug, name, description, price_crc, is_active, is_featured,
      brand:brands(name),
      category:categories(name),
      images:product_images(id, url, alt, position),
      variants:product_variants(id, size, stock)
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ products: data || [] });
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos invalidos." }, { status: 400 });

  const supabase = adminSupabase();
  const payload = parsed.data;

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .upsert({ name: payload.brand, slug: slugify(payload.brand) }, { onConflict: "slug" })
    .select("id")
    .single();
  if (brandError) return NextResponse.json({ error: brandError.message }, { status: 400 });

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .upsert({ name: payload.category, slug: slugify(payload.category) }, { onConflict: "slug" })
    .select("id")
    .single();
  if (categoryError) return NextResponse.json({ error: categoryError.message }, { status: 400 });

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      brand_id: brand.id,
      category_id: category.id,
      name: payload.name,
      slug: slugify(payload.slug),
      description: payload.description,
      price_crc: payload.price_crc,
      is_active: true
    })
    .select("id")
    .single();
  if (productError) return NextResponse.json({ error: productError.message }, { status: 400 });

  if (payload.image_url) {
    await supabase.from("product_images").insert({ product_id: product.id, url: payload.image_url, alt: payload.name, position: 0 });
  }

  if (payload.variants.length) {
    await supabase.from("product_variants").insert(payload.variants.map((variant) => ({
      product_id: product.id,
      size: variant.size.toUpperCase(),
      stock: variant.stock
    })));
  }

  return NextResponse.json({ ok: true, productId: product.id });
}

export async function PATCH(request: Request) {
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos invalidos." }, { status: 400 });

  const supabase = adminSupabase();
  const payload = parsed.data;

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .upsert({ name: payload.brand, slug: slugify(payload.brand) }, { onConflict: "slug" })
    .select("id")
    .single();
  if (brandError) return NextResponse.json({ error: brandError.message }, { status: 400 });

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .upsert({ name: payload.category, slug: slugify(payload.category) }, { onConflict: "slug" })
    .select("id")
    .single();
  if (categoryError) return NextResponse.json({ error: categoryError.message }, { status: 400 });

  const { error: productError } = await supabase
    .from("products")
    .update({
      brand_id: brand.id,
      category_id: category.id,
      name: payload.name,
      slug: slugify(payload.slug),
      description: payload.description,
      price_crc: payload.price_crc,
      is_active: payload.is_active ?? true,
      updated_at: new Date().toISOString()
    })
    .eq("id", payload.id);
  if (productError) return NextResponse.json({ error: productError.message }, { status: 400 });

  await supabase.from("product_images").delete().eq("product_id", payload.id);
  if (payload.image_url) {
    await supabase.from("product_images").insert({ product_id: payload.id, url: payload.image_url, alt: payload.name, position: 0 });
  }

  await supabase.from("product_variants").delete().eq("product_id", payload.id);
  if (payload.variants.length) {
    const { error: variantsError } = await supabase.from("product_variants").insert(payload.variants.map((variant) => ({
      product_id: payload.id,
      size: variant.size.toUpperCase(),
      stock: variant.stock
    })));
    if (variantsError) return NextResponse.json({ error: variantsError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el producto." }, { status: 400 });

  const supabase = adminSupabase();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
