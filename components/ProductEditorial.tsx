import type { Product } from "@/lib/types";

export function ProductEditorial({ product }: { product: Product }) {
  return (
    <section className="mt-10 grid gap-4">
      <EditorialCard title="Por que la elegimos">
        Esta pieza entra al drop por su grafica, fit y rareza dentro de la curaduria de Origin Studios.
      </EditorialCard>
      <EditorialCard title="Fit y uso">
        Pensada para uso diario con estetica streetwear premium. Si buscas un fit relajado, manten tu talla habitual; si prefieres mas oversized, sube una talla.
      </EditorialCard>
      <EditorialCard title="Disponibilidad">
        Drop limitado. No mostramos cantidades exactas por talla, pero las tallas agotadas se bloquean automaticamente.
      </EditorialCard>
      <EditorialCard title="Curated by Origin">
        {product.brand?.name || "Origin Studios"} seleccionado para una compra rapida, confiable y con verificacion manual de pago.
      </EditorialCard>
    </section>
  );
}

function EditorialCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="border-l-4 border-wine bg-warmwhite p-5">
      <h2 className="font-editorial text-2xl text-deepwine">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/70">{children}</p>
    </article>
  );
}
