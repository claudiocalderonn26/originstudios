"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { crc } from "@/lib/currency";

const baseSizes = ["XS", "S", "M", "L", "XL", "XXL"];

type AdminProduct = Product & {
  category: { name: string } | null;
};

export function AdminInventoryManager({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) => [
      product.name,
      product.slug,
      product.brand?.name,
      product.category?.name
    ].filter(Boolean).join(" ").toLowerCase().includes(needle));
  }, [products, query]);

  async function refresh() {
    const response = await fetch("/api/admin/products", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) setProducts(data.products || []);
  }

  async function saveProduct(form: HTMLFormElement, product: AdminProduct) {
    setMessage("Guardando cambios...");
    const formData = new FormData(form);
    const variants = baseSizes
      .map((size) => {
        const value = formData.get(`stock_${size}`);
        return value === "" || value === null ? null : { size, stock: Number(value) };
      })
      .filter((variant): variant is { size: string; stock: number } => Boolean(variant));

    const payload = {
      id: product.id,
      brand: formData.get("brand"),
      category: formData.get("category"),
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      price_crc: Number(formData.get("price_crc") || 0),
      image_url: formData.get("image_url"),
      is_active: formData.get("is_active") === "on",
      variants
    };

    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setMessage(response.ok ? "Producto actualizado." : data.error || "No se pudo actualizar.");
    if (response.ok) await refresh();
  }

  async function deleteProduct(product: AdminProduct) {
    if (!confirm(`Eliminar definitivamente ${product.name}?`)) return;
    setMessage("Eliminando producto...");
    const response = await fetch(`/api/admin/products?id=${product.id}`, { method: "DELETE" });
    const data = await response.json();
    setMessage(response.ok ? "Producto eliminado." : data.error || "No se pudo eliminar.");
    if (response.ok) await refresh();
  }

  return (
    <section className="rounded border border-ink/10 bg-warmwhite p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-wine">Inventario</p>
          <h2 className="mt-2 font-editorial text-4xl text-deepwine">Editar prendas</h2>
          <p className="mt-2 text-sm text-warmgray">
            Cambia nombres, marca, precio, imagen, tallas y cantidades. Para quitar una talla, deja su stock en blanco.
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar producto o marca..."
          className="w-full border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-wine md:max-w-sm"
        />
      </div>

      {message ? <p className="mt-4 rounded bg-cream px-4 py-3 text-sm text-wine">{message}</p> : null}

      <div className="mt-6 grid gap-5">
        {filteredProducts.map((product) => {
          const stockBySize = new Map(product.variants.map((variant) => [variant.size.toUpperCase(), variant.stock]));
          const imageUrl = product.images?.[0]?.url || "";
          const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);

          return (
            <form
              key={product.id}
              onSubmit={(event) => {
                event.preventDefault();
                void saveProduct(event.currentTarget, product);
              }}
              className="grid gap-4 border border-wine/15 bg-cream p-4 md:grid-cols-[120px_1fr]"
            >
              <div className="overflow-hidden bg-warmwhite">
                {imageUrl ? (
                  <img src={imageUrl} alt={product.name} className="aspect-[4/5] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center p-3 text-center text-xs uppercase text-warmgray">Sin foto</div>
                )}
              </div>

              <div className="grid gap-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-warmgray">{product.brand?.name} · {crc(product.price_crc)}</p>
                    <h3 className="font-editorial text-3xl text-deepwine">{product.name}</h3>
                    <p className="text-xs text-warmgray">Stock total: {totalStock} · {product.is_active ? "Activo" : "Oculto"}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-wine">
                    <input name="is_active" type="checkbox" defaultChecked={product.is_active} />
                    visible
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <AdminField name="brand" label="Marca" defaultValue={product.brand?.name || ""} />
                  <AdminField name="category" label="Categoria" defaultValue={product.category?.name || ""} />
                  <AdminField name="name" label="Nombre" defaultValue={product.name} />
                  <AdminField name="slug" label="Slug" defaultValue={product.slug} />
                  <AdminField name="price_crc" label="Precio" type="number" defaultValue={product.price_crc.toString()} />
                  <AdminField name="image_url" label="Imagen URL" defaultValue={imageUrl} className="md:col-span-3" />
                </div>

                <label className="grid gap-2 text-sm">
                  <span>Descripcion</span>
                  <textarea
                    name="description"
                    defaultValue={product.description || ""}
                    className="min-h-20 border border-ink/15 bg-warmwhite px-4 py-3 outline-none focus:border-wine"
                  />
                </label>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.22em] text-warmgray">Tallas / cantidades</p>
                  <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                    {baseSizes.map((size) => (
                      <AdminField
                        key={size}
                        name={`stock_${size}`}
                        label={size}
                        type="number"
                        required={false}
                        defaultValue={stockBySize.has(size) ? String(stockBySize.get(size)) : ""}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="bg-wine px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-cream">Guardar</button>
                  <button type="button" onClick={() => void deleteProduct(product)} className="border border-ink/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink">
                    Eliminar
                  </button>
                </div>
              </div>
            </form>
          );
        })}
      </div>
    </section>
  );
}

function AdminField({
  name,
  label,
  type = "text",
  defaultValue = "",
  required = true,
  className = ""
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 text-sm ${className}`}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="border border-ink/15 bg-warmwhite px-3 py-2 outline-none focus:border-wine"
      />
    </label>
  );
}
