import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { crc } from "@/lib/currency";
import { getProduct } from "@/lib/products";
import { ProductEditorial } from "@/components/ProductEditorial";
import { SizeGuide } from "@/components/SizeGuide";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const soldOut = product.variants.every((variant) => variant.stock <= 0);

  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-[1.15fr_0.85fr] md:px-8">
      <section className="grid gap-4 md:grid-cols-2">
        {product.images.length ? product.images.map((image) => (
          <img key={image.id} src={image.url} alt={image.alt || product.name} className="aspect-[4/5] w-full bg-warmwhite object-cover" />
        )) : <div className="flex aspect-[4/5] items-center justify-center bg-warmwhite p-8 text-center font-editorial text-4xl text-deepwine">Foto pendiente</div>}
      </section>
      <aside className="md:sticky md:top-24 md:self-start">
        <p className="text-xs uppercase tracking-[0.28em] text-warmgray">{product.brand?.name}</p>
        <h1 className="mt-3 font-editorial text-5xl">{product.name}</h1>
        <p className="mt-4 text-xl">{product.price_crc > 0 ? crc(product.price_crc) : "Precio por confirmar"}</p>
        {soldOut ? <p className="mt-4 inline-block bg-ink px-3 py-1 text-xs uppercase tracking-[0.2em] text-cream">Sold out</p> : null}
        <p className="mt-6 leading-7 text-ink/75">{product.description || "Descripción pendiente de configurar desde el panel administrador."}</p>
        <AddToCart product={product} />
        <ProductEditorial product={product} />
        <SizeGuide brand={product.brand?.name} />
      </aside>
    </main>
  );
}
