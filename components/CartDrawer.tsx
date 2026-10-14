"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";
import { crc } from "@/lib/currency";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    const sync = () => setLines(JSON.parse(localStorage.getItem("origin-cart") || "[]"));
    sync();
    window.addEventListener("origin-cart-updated", sync);
    return () => window.removeEventListener("origin-cart-updated", sync);
  }, []);

  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.price * line.quantity, 0), [lines]);

  function save(next: CartLine[]) {
    setLines(next);
    localStorage.setItem("origin-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("origin-cart-updated"));
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <button className={`absolute inset-0 bg-ink/30 transition ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-warmwhite p-6 shadow-2xl transition duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <h2 className="font-editorial text-3xl">Carrito</h2>
          <button onClick={onClose} className="text-sm uppercase tracking-[0.2em]">Cerrar</button>
        </div>
        <div className="flex-1 overflow-auto py-5">
          {lines.length === 0 ? (
            <p className="text-sm text-warmgray">Tu carrito está vacío.</p>
          ) : (
            <div className="space-y-4">
              {lines.map((line) => (
                <article key={line.variantId} className="flex gap-4 border-b border-ink/10 pb-4">
                  <img src={line.image || "/placeholder.svg"} alt="" className="h-24 w-20 object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold">{line.brand}</p>
                    <p>{line.name}</p>
                    <p className="text-warmgray">Talla {line.size}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => save(lines.map((x) => x.variantId === line.variantId ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))}>-</button>
                      <span>{line.quantity}</span>
                      <button onClick={() => save(lines.map((x) => x.variantId === line.variantId ? { ...x, quantity: x.quantity + 1 } : x))}>+</button>
                      <button className="ml-auto text-wine" onClick={() => save(lines.filter((x) => x.variantId !== line.variantId))}>Eliminar</button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{crc(line.price * line.quantity)}</p>
                </article>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-ink/10 pt-5">
          <div className="flex justify-between text-sm"><span>Subtotal</span><strong>{crc(subtotal)}</strong></div>
          <p className="mt-2 text-xs text-warmgray">El envío se calcula en checkout según zona configurada.</p>
          <a href="/checkout" className="mt-5 block w-full bg-ink px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.25em] text-cream">Checkout</a>
        </div>
      </aside>
    </div>
  );
}
