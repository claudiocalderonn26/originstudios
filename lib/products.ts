import { adminSupabase, publicSupabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import { fallbackProducts, inventoryPrices } from "@/lib/inventory";
import { productImageMap } from "@/lib/product-image-map";

const productSelect = `
  id, slug, name, description, price_crc, is_active, is_featured,
  brand:brands(name),
  category:categories(name),
  images:product_images(id, url, alt, position),
  variants:product_variants(id, size, stock)
`;

export async function getProducts() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return fallbackProducts;
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? adminSupabase() : publicSupabase();
  const result = await withTimeout(
    supabase
      .from("products")
      .select(productSelect)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    1800
  );

  if (!result || result.error) return fallbackProducts;
  return normalize(result.data as unknown as Product[]);
}

export async function getProduct(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return fallbackProducts.find((product) => product.slug === slug) || null;
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? adminSupabase() : publicSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return fallbackProducts.find((product) => product.slug === slug) || null;
  return normalize([data as unknown as Product])[0];
}

function normalize(products: Product[]) {
  return products.map((product) => {
    const localImages = (productImageMap[product.slug] || []).map((image, index) => ({
      id: `${product.id}-local-image-${index}`,
      url: image.url,
      alt: `${product.name} foto ${index + 1}`,
      position: image.position
    }));

    return {
      ...product,
      price_crc: product.price_crc > 0 ? product.price_crc : inventoryPrices[product.slug] || 0,
      images: [...((product.images?.length ? product.images : localImages) || [])].sort((a, b) => a.position - b.position),
      variants: product.variants || []
    };
  });
}

async function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T | null> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return Promise.race([
    Promise.resolve(promise),
    new Promise<null>((resolve) => {
      timeout = setTimeout(() => resolve(null), ms);
    })
  ]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}
