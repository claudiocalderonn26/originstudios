"use client";

import { useState } from "react";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export function ProductCreator() {
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Guardando...");
    const form = new FormData(event.currentTarget);
    const payload = {
      brand: form.get("brand"),
      category: form.get("category"),
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description"),
      price_crc: Number(form.get("price_crc")),
      image_url: form.get("image_url"),
      variants: sizes
        .map((size) => ({
          size,
          stock: Number(form.get(`stock_${size}`) || 0)
        }))
        .filter((variant) => variant.stock > 0)
    };

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setMessage(response.ok ? "Producto creado." : data.error || "No se pudo guardar.");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded border border-ink/10 bg-warmwhite p-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="font-editorial text-3xl">Crear producto</h2>
        <p className="mt-2 text-sm text-warmgray">Carga rapida de producto, precio, imagen principal y stock por talla.</p>
      </div>
      <Field name="brand" label="Marca" placeholder="Nude Project" />
      <Field name="category" label="Categoria" placeholder="Camisetas" />
      <Field name="name" label="Nombre" placeholder="Smooth Tee" />
      <Field name="slug" label="Slug" placeholder="smooth-tee-navy" />
      <Field name="price_crc" label="Precio CRC" type="number" placeholder="39900" />
      <Field name="image_url" label="URL imagen principal" placeholder="https://..." />
      <label className="grid gap-2 text-sm md:col-span-2">
        <span>Descripcion</span>
        <textarea name="description" className="min-h-24 border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-wine" />
      </label>
      <div className="grid grid-cols-3 gap-3 md:col-span-2 md:grid-cols-6">
        {sizes.map((size) => <Field key={size} name={`stock_${size}`} label={`Stock ${size}`} type="number" placeholder="0" required={false} />)}
      </div>
      <button className="bg-ink px-5 py-4 text-xs font-bold uppercase tracking-[0.24em] text-cream md:col-span-2">Crear producto</button>
      {message ? <p className="text-sm text-warmgray md:col-span-2">{message}</p> : null}
    </form>
  );
}

function Field({ name, label, type = "text", placeholder = "", required = true }: { name: string; label: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm">
      <span>{label}</span>
      <input name={name} type={type} placeholder={placeholder} required={required} className="border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-wine" />
    </label>
  );
}
