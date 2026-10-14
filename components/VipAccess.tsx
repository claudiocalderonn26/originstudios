"use client";

import { useState } from "react";

export function VipAccess() {
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("Guardando acceso...");
    const response = await fetch("/api/vip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        email: form.get("email")
      })
    });
    const data = await response.json();
    setMessage(response.ok ? "Listo. Quedaste en la lista de acceso anticipado." : data.error || "No se pudo guardar.");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <section id="vip" className="border-y border-wine/15 bg-warmwhite px-4 py-16 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div>
          <p className="text-xs uppercase text-wine">Acceso anticipado</p>
          <h2 className="mt-2 font-editorial text-5xl text-deepwine">Origin VIP List</h2>
          <p className="mt-5 max-w-md leading-7 text-ink/75">
            Entra primero a los drops, recibe avisos antes que Instagram y reserva piezas limitadas antes de que salgan al público.
          </p>
        </div>
        <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-wine/20 bg-cream p-5 md:grid-cols-3">
          <input name="name" required placeholder="Nombre" className="border border-wine/20 bg-warmwhite px-4 py-3 outline-none focus:border-wine" />
          <input name="phone" required placeholder="WhatsApp" className="border border-wine/20 bg-warmwhite px-4 py-3 outline-none focus:border-wine" />
          <input name="email" type="email" placeholder="Correo opcional" className="border border-wine/20 bg-warmwhite px-4 py-3 outline-none focus:border-wine" />
          <button className="bg-wine px-5 py-4 text-xs font-bold uppercase text-cream transition hover:bg-deepwine md:col-span-3">
            Quiero acceso anticipado
          </button>
          {message ? <p className="text-sm text-warmgray md:col-span-3">{message}</p> : null}
        </form>
      </div>
    </section>
  );
}
