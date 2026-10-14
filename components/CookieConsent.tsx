"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "origin-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setVisible(!saved);
  }, []);

  function saveConsent(value: "accepted" | "rejected") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      value,
      savedAt: new Date().toISOString(),
      version: "2026-10"
    }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <section
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-5xl rounded-2xl border border-wine/25 bg-warmwhite p-4 shadow-2xl md:bottom-6 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-6 md:p-5"
    >
      <div>
        <p className="font-editorial text-2xl text-deepwine">Cookies y privacidad</p>
        <p className="mt-2 text-sm leading-6 text-ink/75">
          Usamos cookies necesarias para que la tienda funcione, guardar tu carrito y mejorar la experiencia.
          Las cookies opcionales solo se activan si aceptas. Puedes leer más en nuestra{" "}
          <a href="/privacidad" className="font-semibold text-wine underline underline-offset-4">
            política de privacidad
          </a>.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row md:mt-0">
        <button
          type="button"
          onClick={() => saveConsent("rejected")}
          className="border border-wine px-5 py-3 text-xs font-bold uppercase text-wine transition hover:bg-cream"
        >
          Rechazar
        </button>
        <button
          type="button"
          onClick={() => saveConsent("accepted")}
          className="bg-wine px-5 py-3 text-xs font-bold uppercase text-cream transition hover:bg-deepwine"
        >
          Aceptar cookies
        </button>
      </div>
    </section>
  );
}
