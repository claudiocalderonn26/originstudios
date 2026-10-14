import { publicSupabase } from "@/lib/supabase";
import { unstable_cache } from "next/cache";
import type { Product } from "@/lib/types";
import { fallbackProducts } from "@/lib/inventory";
import { productImageMap } from "@/lib/product-image-map";

const productSelect = `
  id, slug, name, description, price_crc, is_active, is_featured,
  brand:brands(name),
  category:categories(name),
  images:product_images(id, url, alt, position),
  variants:product_variants(id, size, stock)
`;

const loadProducts = unstable_cache(async () => {
  const { data, error } = await publicSupabase()
      .from("products")
      .select(productSelect)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .abortSignal(AbortSignal.timeout(6000));
  if (error) throw error;
  return normalize(data as unknown as Product[]);
}, ["store-products-v2"], { revalidate: 60, tags: ["products"] });

export async function getProducts() {
  try { return await loadProducts(); } catch {
    // Keep the editorial catalog visible without inventing live availability.
    return fallbackProducts.map(product => ({ ...product, availabilityUnknown: true, variants: product.variants.map(variant => ({ ...variant, stock: 0 })) }));
  }
}

export async function getProduct(slug: string) {
  return (await getProducts()).find(product => product.slug === slug) || null;
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
      price_crc: product.price_crc,
      images: [...((product.images?.length ? product.images : localImages) || [])].sort((a, b) => a.position - b.position),
      variants: product.variants || []
    };
  });
}
