"use client";

import { useState } from "react";
import { crc } from "@/lib/currency";

type TrackingResult = {
  order_number: string;
  payment_status: string;
  fulfillment_status: string;
  total_crc: number;
  created_at: string;
  tracking_number: string | null;
} | null;

export function TrackingForm() {
  const [result, setResult] = useState<TrackingResult>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setResult(null);
    const form = new FormData(event.currentTarget);
    try {
    const response = await fetch("/api/tracking", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderNumber: form.get("orderNumber"),
        phone: form.get("phone")
      })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error || "No encontramos esa orden.");
      return;
    }
    setResult(data.order);
    } catch {
      setMessage("No pudimos conectar. Intenta nuevamente en un momento.");
    } finally { setLoading(false); }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={submit} className="rounded-2xl border border-wine/20 bg-warmwhite p-6">
        <h2 className="font-editorial text-3xl text-deepwine">Consulta tu pedido</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">Usamos número de orden + teléfono para que nadie pueda ver tu información solo adivinando un código.</p>
        <label className="mt-6 grid gap-2 text-sm">
          <span>Número de orden</span>
          <input name="orderNumber" required placeholder="OS-2026-0001" className="border border-wine/20 bg-cream px-4 py-3 outline-none focus:border-wine" />
        </label>
        <label className="mt-4 grid gap-2 text-sm">
          <span>Teléfono usado en la compra</span>
          <input name="phone" required placeholder="8888-8888" className="border border-wine/20 bg-cream px-4 py-3 outline-none focus:border-wine" />
        </label>
        <button disabled={loading} className="mt-6 w-full bg-wine px-5 py-4 text-xs font-bold uppercase text-cream transition hover:bg-deepwine disabled:bg-warmgray">
          {loading ? "Buscando..." : "Ver estado"}
        </button>
        {message ? <p className="mt-4 text-sm text-wine">{message}</p> : null}
      </form>

      <div className="rounded-2xl border border-wine/20 bg-deepwine p-6 text-cream">
        {result ? (
          <>
            <p className="text-xs uppercase text-cream/70">Orden {result.order_number}</p>
            <h3 className="mt-2 font-editorial text-4xl">Estado del pedido</h3>
            <div className="mt-6 grid gap-3">
              <Status label="Pago" value={result.payment_status} />
              <Status label="Preparación" value={result.fulfillment_status} />
              <Status label="Total" value={crc(result.total_crc)} />
              <Status label="Guía" value={result.tracking_number || "Pendiente"} />
            </div>
          </>
        ) : (
          <>
            <p className="text-xs uppercase text-cream/70">Track your order</p>
            <h3 className="mt-2 font-editorial text-4xl">Recibido → Verificación → Enviado</h3>
            <p className="mt-5 leading-7 text-cream/75">Aquí aparecerá el estado real cuando ingreses tus datos de orden.</p>
          </>
        )}
      </div>
    </div>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-cream/15 py-3 text-sm">
      <span className="text-cream/70">{label}</span>
      <strong className="text-right uppercase">{value.replaceAll("_", " ")}</strong>
    </div>
  );
}
