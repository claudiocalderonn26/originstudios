"use client";

import { useEffect, useState } from "react";
import type { CartLine } from "@/lib/types";
import { CartDrawer } from "@/components/CartDrawer";
import { OriginLogo } from "@/components/OriginLogo";

export function Header() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      const cart = JSON.parse(localStorage.getItem("origin-cart") || "[]") as CartLine[];
      setCount(cart.reduce((sum, line) => sum + line.quantity, 0));
    };
    sync();
    window.addEventListener("origin-cart-updated", sync);
    return () => window.removeEventListener("origin-cart-updated", sync);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-wine/20 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <a href="/" className="rounded-full pr-4 transition hover:bg-warmwhite">
            <OriginLogo compact />
          </a>
          <nav className="hidden items-center gap-8 text-xs uppercase text-deepwine md:flex">
            <a href="/">Inicio</a>
            <a href="/#shop">Tienda</a>
            <a href="/#brands">Marcas</a>
            <a href="/#drops">Nuevos drops</a>
            <a href="/tracking">Pedidos</a>
            <a href="/#contact">Contacto</a>
          </nav>
          <button
            className="rounded-full border border-wine bg-wine px-4 py-2 text-xs uppercase text-cream transition hover:bg-deepwine"
            onClick={() => setOpen(true)}
          >
            Carrito ({count})
          </button>
        </div>
      </header>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
