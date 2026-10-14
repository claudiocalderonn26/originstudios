"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";
import { crc } from "@/lib/currency";

type Result = {
  orderNumber: string;
  verificationToken: string;
  total: number;
  notifications?: { email: "sent" | "skipped" | "failed"; whatsapp: "sent" | "skipped" | "failed" };
} | null;

export function CheckoutForm() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.price * line.quantity, 0), [lines]);

  useEffect(() => {
    setLines(JSON.parse(localStorage.getItem("origin-cart") || "[]"));
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    const payload = {
      customer: Object.fromEntries(formData.entries()),
      items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
      paymentMethod: formData.get("payment_method")
    };
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      alert(data.error || "No se pudo crear la orden.");
      return;
    }
    localStorage.removeItem("origin-cart");
    window.dispatchEvent(new Event("origin-cart-updated"));
    setResult(data);
  }

  if (result) {
    const summary = `Orden ${result.orderNumber} - Total ${crc(result.total)} - SINPE 8603-7873`;
    const whatsapp = `https://wa.me/50686037873?text=${encodeURIComponent(`Hola Origin Studios, quiero confirmar mi orden ${result.orderNumber}. Total ${crc(result.total)}.`)}`;
    return (
      <div className="rounded-2xl border border-wine/20 bg-warmwhite p-8">
        <p className="text-xs uppercase text-wine">Reserva activa</p>
        <p className="mt-2 font-editorial text-5xl text-deepwine">Tu pieza quedo reservada.</p>
        <p className="mt-4 text-lg">Numero de orden: <strong>{result.orderNumber}</strong></p>
        <p className="mt-2">Total a pagar: <strong>{crc(result.total)}</strong></p>
        <p className="mt-3 text-sm text-ink/70">
          Te enviamos la confirmacion al correo ingresado. Origin Studios tambien recibe el aviso automatico por WhatsApp cuando la integracion esta configurada.
        </p>
        <div className="mt-6 rounded-xl bg-cream p-5 text-sm leading-6 text-ink/75">
          Realiza el SINPE al <strong>8603-7873</strong> o la transferencia BAC configurada en tienda.
          Incluye el numero de orden en el detalle. Tu pedido queda en verificacion manual hasta confirmar el comprobante.
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="border border-wine px-5 py-3 text-xs font-bold uppercase text-wine" onClick={() => navigator.clipboard.writeText(summary)}>Copiar resumen</button>
          <a className="bg-wine px-5 py-3 text-xs font-bold uppercase text-cream" href={whatsapp} target="_blank" rel="noreferrer">Enviar por WhatsApp</a>
          <a className="border border-ink/20 px-5 py-3 text-xs font-bold uppercase text-ink" href="/tracking">Ver tracking</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-8 md:grid-cols-[1fr_380px]">
      <section className="space-y-6">
        <Panel title="Informacion personal">
          <Field name="full_name" label="Nombre completo" required />
          <Field name="id_number" label="Numero de cedula" required />
          <Field name="phone" label="Telefono de Costa Rica" required />
          <Field name="email" label="Correo electronico para confirmacion" type="email" required />
        </Panel>
        <Panel title="Entrega">
          <Field name="province" label="Provincia" required />
          <Field name="canton" label="Canton" required />
          <Field name="district" label="Distrito" required />
          <Field name="address" label="Direccion exacta" required />
          <Field name="notes" label="Senas adicionales" />
        </Panel>
        <Panel title="Metodo de pago">
          <label className="flex gap-3"><input type="radio" name="payment_method" value="sinpe" defaultChecked /> SINPE Movil 8603-7873</label>
          <label className="flex gap-3"><input type="radio" name="payment_method" value="bac" /> Transferencia bancaria BAC</label>
          <Field name="payment_reference" label="Referencia de transferencia (opcional)" />
        </Panel>
        <div className="rounded-2xl border border-wine/20 bg-cream p-5">
          <p className="font-editorial text-3xl text-deepwine">Reserva temporal</p>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Al generar la orden, el sistema reserva las unidades mientras verificas el pago. Si no se confirma, el inventario puede liberarse segun la configuracion de tienda.
          </p>
        </div>
      </section>
      <aside className="h-fit rounded border border-ink/10 bg-warmwhite p-6">
        <h2 className="font-editorial text-3xl">Resumen</h2>
        <div className="mt-5 space-y-3">
          {lines.map((line) => (
            <div key={line.variantId} className="flex justify-between gap-4 text-sm">
              <span>{line.brand} {line.name} - {line.size} x {line.quantity}</span>
              <strong>{crc(line.price * line.quantity)}</strong>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-ink/10 pt-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><strong>{crc(subtotal)}</strong></div>
          <div className="mt-2 flex justify-between text-warmgray"><span>Envio</span><span>Pendiente de zona</span></div>
          <p className="mt-4 text-xs text-warmgray">Si la zona no tiene tarifa configurada, la orden queda pendiente de cotizacion.</p>
        </div>
        <button disabled={loading || lines.length === 0} className="mt-6 w-full bg-ink px-5 py-4 text-xs font-bold uppercase tracking-[0.24em] text-cream disabled:bg-warmgray">
          {loading ? "Creando orden..." : "Generar orden"}
        </button>
      </aside>
    </form>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded border border-ink/10 bg-warmwhite p-6"><h2 className="mb-5 font-editorial text-3xl">{title}</h2><div className="grid gap-4">{children}</div></div>;
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm"><span>{label}</span><input name={name} type={type} required={required} className="border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-wine" /></label>;
}
