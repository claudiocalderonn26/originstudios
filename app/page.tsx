import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";
import { OriginLogo } from "@/components/OriginLogo";
import { VipAccess } from "@/components/VipAccess";
import type { Product } from "@/lib/types";
import Image from "next/image";

export const revalidate = 60;

const brandMenu = [
  {
    name: "Nude Project",
    slug: "nude-project"
  },
  {
    name: "Scuffers",
    slug: "scuffers"
  },
  {
    name: "EME Studios",
    slug: "eme-studios"
  },
  {
    name: "Broken Planet",
    slug: "broken-planet"
  },
  {
    name: "Stussy",
    slug: "stussy"
  },
  {
    name: "Casablanca",
    slug: "casablanca"
  }
];

export default async function HomePage() {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch {
    products = [];
  }
  const featuredProducts = [...products]
    .sort((a, b) => Number(b.images.length > 0) - Number(a.images.length > 0))
    .slice(0, 12);

  return (
    <main className="bg-cream">
      <section className="relative overflow-hidden border-b border-wine/15">
        <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-deepwine md:block" />
        <div className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-[1.04fr_0.96fr] md:px-8">
          <div className="relative z-10 pb-10 reveal">
            <div className="mb-8 inline-flex rounded-full border border-wine/20 bg-warmwhite px-5 py-3 shadow-sm">
              <OriginLogo />
            </div>
            <p className="text-xs uppercase text-wine">San Jose, Costa Rica</p>
            <h1 className="mt-5 font-editorial text-6xl leading-none text-deepwine md:text-8xl">ORIGIN STUDIOS</h1>
            <p className="mt-6 max-w-md text-lg text-ink/75">Enviamos a todo el pais y Entregas Personales con costo adicional.</p>
            <div className="mt-6 grid max-w-md grid-cols-2 gap-3">
              <div className="border border-wine/20 bg-warmwhite p-4">
                <p className="font-editorial text-4xl text-deepwine">{products.length}</p>
                <p className="text-xs uppercase text-wine">modelos cargados</p>
              </div>
              <div className="border border-wine/20 bg-warmwhite p-4">
                <p className="font-editorial text-4xl text-deepwine">{products.some(p => p.availabilityUnknown) ? "—" : products.reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.stock, 0), 0)}</p>
                <p className="text-xs uppercase text-wine">prendas en stock</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#shop" className="inline-block bg-wine px-6 py-4 text-xs font-bold uppercase text-cream transition hover:bg-deepwine">Ver destacados</a>
              <a href="#brands" className="inline-block border border-wine px-6 py-4 text-xs font-bold uppercase text-wine transition hover:bg-warmwhite">Ver marcas</a>
            </div>
          </div>

          <div className="relative z-10 aspect-[4/5] bg-wine p-4 shadow-2xl reveal md:p-6">
            <div className="flex h-full items-center justify-center border border-cream/45 bg-cream text-center">
              <div>
                <div className="mx-auto mb-6 flex justify-center">
                  <Image src="/logo-origin.jpeg" alt="Origin Studios" width={384} height={384} sizes="(max-width: 768px) 144px, 192px" priority className="h-36 w-36 rounded-full object-cover ring-2 ring-wine/25 md:h-48 md:w-48" />
                </div>
                <p className="font-editorial text-5xl text-deepwine">Drop editorial</p>
                <p className="mt-3 max-w-xs text-sm text-warmgray">Prendas seleccionadas para expresar tu estilo. Encuentra tu próxima favorita.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase text-wine">New Arrivals</p>
            <h2 className="mt-2 font-editorial text-5xl text-deepwine">Destacados</h2>
            <p className="mt-2 max-w-xl text-sm text-ink/65">Una seleccion rapida del drop. Para ver todo el inventario, entra por marca.</p>
          </div>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>

      <section id="drops" className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Feature title="Reserva temporal" text="Cuando generas una orden, las piezas quedan reservadas mientras verificas el pago." />
          <Feature title="Paga a tu manera" text="SINPE, transferencia BAC, efectivo o pago contra entrega. Coordinamos los detalles contigo." />
          <Feature title="Track your order" text="Consulta tu pedido con numero de orden y telefono, sin depender del DM." />
        </div>
      </section>

      <VipAccess />

      <section id="brands" className="bg-deepwine px-4 py-16 text-cream md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase text-cream/70">Marcas seleccionadas</p>
          <h2 className="mt-2 font-editorial text-5xl">Curated brands</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-cream/70">
            Elige una marca y baja directo a todos los productos disponibles de esa selección.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brandMenu.map((brand) => (
              <a
                key={brand.slug}
                href={`#brand-${brand.slug}`}
                className="group relative overflow-hidden border border-cream/20 bg-cream/10 p-6 transition hover:-translate-y-1 hover:border-cream hover:bg-cream hover:text-deepwine"
              >
                <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-wine/40 blur-2xl transition group-hover:bg-wine/20" />
                <span className="relative text-[10px] uppercase tracking-[0.3em] text-cream/60 transition group-hover:text-wine">Ver productos</span>
                <span className="relative mt-4 block font-editorial text-4xl leading-none">{brand.name}</span>
                <span className="relative mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em]">
                  by Origin Studios
                  <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-10">
          <p className="text-xs uppercase text-wine">Shop by brand</p>
          <h2 className="mt-2 font-editorial text-5xl text-deepwine">Productos por marca</h2>
        </div>
        <div className="space-y-16">
          {brandMenu.map((brand) => {
            const brandProducts = products.filter((product) => product.brand?.name === brand.name);
            if (!brandProducts.length) return null;

            return (
              <section key={brand.slug} id={`brand-${brand.slug}`} className="scroll-mt-28 border-t border-wine/15 pt-10">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-wine">by Origin Studios</p>
                    <h3 className="mt-2 font-editorial text-4xl text-deepwine md:text-5xl">{brand.name}</h3>
                  </div>
                  <a href="#brands" className="border border-wine/25 px-4 py-3 text-xs font-bold uppercase text-wine transition hover:bg-warmwhite">
                    Volver a marcas
                  </a>
                </div>
                <ProductGrid products={brandProducts} />
              </section>
            );
          })}
        </div>
      </section>

      <footer id="contact" className="border-t border-wine/15 bg-cream px-4 py-10 text-center text-sm text-wine">
        @originstudios.cr - San Jose, Costa Rica
      </footer>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <article className="border border-wine/20 bg-warmwhite p-6">
      <h3 className="font-editorial text-3xl text-deepwine">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-ink/70">{text}</p>
    </article>
  );
}
