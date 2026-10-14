import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { crc } from "@/lib/currency";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="rounded border border-ink/10 bg-warmwhite p-10 text-center">
        <p className="font-editorial text-3xl">Catálogo listo para configurar.</p>
        <p className="mt-3 text-sm text-warmgray">Agrega productos desde Supabase o desde el panel admin cuando conectes la base de datos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-7">
      {products.map((product) => {
        const soldOut = product.variants.every((variant) => variant.stock <= 0);
        const price = product.price_crc;
        const coverImage = product.images.length >= 3 ? product.images[2] : product.images[0];
        const catalogImage = coverImage?.url || "";
        return (
          <Link href={`/products/${product.slug}`} prefetch={false} key={product.id} className="group reveal">
            <div className="relative aspect-[4/5] overflow-hidden bg-warmwhite">
              {catalogImage ? (
                <Image
                  src={catalogImage}
                  alt={coverImage?.alt || product.name}
                  fill
                  sizes="(max-width: 767px) 46vw, (max-width: 1280px) 23vw, 280px"
                  quality={80}
                  unoptimized={!catalogImage.startsWith("/") && !/^https:\/\/([^/]+\.supabase\.co|cdn\.shopify\.com)\//.test(catalogImage)}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full bg-[#f8f8f7] object-contain p-2 transition duration-300 group-hover:scale-[1.02]"
                />
              ) : <ProductPlaceholder brand={product.brand?.name || "Origin"} name={product.name} />}
              {soldOut ? <span className="absolute left-3 top-3 bg-ink px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cream">{product.availabilityUnknown ? "Consultar disponibilidad" : "Agotado"}</span> : null}
            </div>
            <div className="mt-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-warmgray">{product.brand?.name}</p>
              <h3 className="mt-1 text-sm font-semibold">{product.name}</h3>
              <p className="mt-1 text-sm font-semibold text-wine">{price ? crc(price) : "Precio por confirmar"}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ProductPlaceholder({ brand, name }: { brand: string; name: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#790E1922,transparent_45%),#FFFCF7] p-5 text-center">
      <p className="text-[10px] uppercase tracking-[0.25em] text-wine">{brand}</p>
      <p className="mt-4 font-editorial text-3xl leading-tight text-deepwine">{name}</p>
      <p className="mt-5 rounded-full border border-wine/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-wine">Foto pendiente</p>
    </div>
  );
}
