"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const available = product.variants.filter((variant) => variant.stock > 0);
  const [variantId, setVariantId] = useState(available[0]?.id || "");
  const selected = product.variants.find((variant) => variant.id === variantId);

  function add() {
    if (!selected || selected.stock <= 0) return;
    const current = JSON.parse(localStorage.getItem("origin-cart") || "[]");
    const existing = current.find((line: any) => line.variantId === selected.id);
    const next = existing
      ? current.map((line: any) => line.variantId === selected.id ? { ...line, quantity: Math.min(selected.stock, line.quantity + 1) } : line)
      : [...current, {
        productId: product.id,
        variantId: selected.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand?.name || "Origin Studios",
        size: selected.size,
        image: product.images[0]?.url || "",
        price: product.price_crc,
        quantity: 1
      }];
    localStorage.setItem("origin-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("origin-cart-updated"));
  }

  const soldOut = available.length === 0;

  return (
    <div className="mt-8">
      <p className="mb-3 text-xs uppercase tracking-[0.22em] text-warmgray">Talla</p>
      <div className="flex flex-wrap gap-2">
        {product.variants.map((variant) => (
          <button
            key={variant.id}
            disabled={variant.stock <= 0}
            onClick={() => setVariantId(variant.id)}
            className={`min-w-14 border px-4 py-3 text-sm ${variant.id === variantId ? "border-ink bg-ink text-cream" : "border-ink/20"} disabled:cursor-not-allowed disabled:text-warmgray disabled:line-through`}
          >
            {variant.size}
          </button>
        ))}
      </div>
      <button disabled={soldOut} onClick={add} className="mt-6 w-full bg-wine px-6 py-4 text-xs font-bold uppercase tracking-[0.25em] text-cream disabled:bg-warmgray">
        {soldOut ? "Sold out" : "Agregar al carrito"}
      </button>
    </div>
  );
}
