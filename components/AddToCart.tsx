"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { readCart, saveCart } from "@/lib/cart";

export function AddToCart({ product }: { product: Product }) {
  const available = product.variants.filter((variant) => variant.stock > 0);
  const [variantId, setVariantId] = useState(available[0]?.id || "");
  const selected = product.variants.find((variant) => variant.id === variantId);
  const [message, setMessage] = useState("");

  function add() {
    if (!selected || selected.stock <= 0) return;
    const current = readCart();
    const existing = current.find(line => line.variantId === selected.id || (line.slug === product.slug && line.size === selected.size));
    const next = existing
      ? current.map(line => line === existing ? { ...line, variantId: selected.id, stock: selected.stock, price: product.price_crc, quantity: Math.min(selected.stock, line.quantity + 1) } : line)
      : [...current, {
        productId: product.id,
        variantId: selected.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand?.name || "Origin Studios",
        size: selected.size,
        image: product.images[0]?.url || "",
        price: product.price_crc,
        stock: selected.stock,
        quantity: 1
      }];
    try {
      saveCart(next);
      setMessage(existing && existing.quantity >= selected.stock ? "Ya tienes las unidades disponibles de esta talla en el carrito." : "Prenda añadida al carrito.");
    } catch { setMessage("Activa el almacenamiento de tu navegador para usar el carrito."); }
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
      <button disabled={soldOut || product.price_crc <= 0} onClick={add} className="mt-6 w-full bg-wine px-6 py-4 text-xs font-bold uppercase tracking-[0.25em] text-cream disabled:bg-warmgray">
        {product.availabilityUnknown ? "Disponibilidad por confirmar" : soldOut ? "Agotado" : "Agregar al carrito"}
      </button>
      <p role="status" className="mt-3 text-sm text-wine">{message}</p>
    </div>
  );
}
