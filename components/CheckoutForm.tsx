"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { readCart } from "@/lib/cart";
import { orderSchema, paymentInstructions, paymentLabels, type PaymentMethod } from "@/lib/checkout";
import type { CartLine } from "@/lib/types";
import { crc } from "@/lib/currency";

type Result = {
  orderNumber: string;
  verificationToken: string;
  total: number;
  paymentMethod: PaymentMethod;
  replayed?: boolean;
  notifications?: { email: "sent" | "skipped" | "failed"; whatsapp: "sent" | "skipped" | "failed" };
} | null;

export function CheckoutForm() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("sinpe");
  const sending = useRef(false);
  const requestId = useRef("");
  const fingerprint = useRef("");
  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.price * line.quantity, 0), [lines]);

  useEffect(() => {
    const sync = () => setLines(readCart());
    sync();
    window.addEventListener("origin-cart-updated", sync);
    window.addEventListener("storage", sync);
    try {
      const saved = JSON.parse(sessionStorage.getItem("origin-checkout-request") || "null");
      requestId.current = saved?.id || "";
      fingerprint.current = saved?.fingerprint || "";
    } catch { /* A new request will be created on submit. */ }
    return () => {
      window.removeEventListener("origin-cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const formData = new FormData(event.currentTarget);
    const currentLines = readCart();
    setLines(currentLines);
    const payload = {
      customer: Object.fromEntries(formData.entries()),
      items: currentLines.map((line) => ({ variantId: line.variantId, slug: line.slug, size: line.size, quantity: line.quantity })),
      paymentMethod: formData.get("payment_method")
    };
    const nextFingerprint = JSON.stringify(payload);
    if (fingerprint.current !== nextFingerprint || !requestId.current) {
      requestId.current = crypto.randomUUID();
      fingerprint.current = nextFingerprint;
    }
    const parsed = orderSchema.safeParse({ ...payload, requestId: requestId.current });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      const field = event.currentTarget.elements.namedItem(String(parsed.error.issues[0].path[1] || ""));
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    sending.current = true;
    setLoading(true);
    setError("");
    try {
    sessionStorage.setItem("origin-checkout-request", JSON.stringify({ id: requestId.current, fingerprint: nextFingerprint }));
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(25000)
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(data?.error || "No pudimos completar la solicitud. Intenta nuevamente.");
      return;
    }
    if (!data?.orderNumber) throw new Error("Missing confirmation");
    setResult(data);
    try {
      localStorage.removeItem("origin-cart");
      sessionStorage.removeItem("origin-checkout-request");
      window.dispatchEvent(new Event("origin-cart-updated"));
    } catch { /* The order is already confirmed even if browser storage fails. */ }
    } catch {
      setError("Se interrumpió la conexión. Tu carrito sigue guardado. Pulsa Generar orden de nuevo para recuperar la confirmación sin duplicar el pedido.");
    } finally {
      sending.current = false;
      setLoading(false);
    }
  }

  if (result) {
    const summary = `Orden ${result.orderNumber} - Prendas: ${crc(result.total)} - ${paymentLabels[result.paymentMethod]} - Envío por cotizar`;
    const whatsapp = `https://wa.me/50686037873?text=${encodeURIComponent(`Hola Origin Studios, quiero coordinar mi ${summary}.`)}`;
    return (
      <div className="rounded-2xl border border-wine/20 bg-warmwhite p-8">
        <p className="text-xs uppercase text-wine">Reserva activa</p>
        <p className="mt-2 font-editorial text-5xl text-deepwine">Tu pieza quedo reservada.</p>
        <p className="mt-4 text-lg">Numero de orden: <strong>{result.orderNumber}</strong></p>
        <p className="mt-2">Total de prendas: <strong>{crc(result.total)}</strong></p>
        <p className="mt-2">Método de pago: <strong>{paymentLabels[result.paymentMethod]}</strong></p>
        <p className="mt-2 text-sm">El envío o la entrega personal se cotiza por separado. Te confirmaremos el monto final.</p>
        <p className="mt-3 text-sm text-ink/70">
          {result.notifications?.email === "sent" ? "La confirmación fue enviada a tu correo." : "Tu orden quedó registrada. Guarda este número para consultar el estado o coordinar por WhatsApp."}
        </p>
        <div className="mt-6 rounded-xl bg-cream p-5 text-sm leading-6 text-ink/75">
          {paymentInstructions(result.paymentMethod)}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="border border-wine px-5 py-3 text-xs font-bold uppercase text-wine" onClick={() => navigator.clipboard.writeText(summary).catch(() => setError("Puedes copiar el número de orden que aparece arriba."))}>Copiar resumen</button>
          <a className="bg-wine px-5 py-3 text-xs font-bold uppercase text-cream" href={whatsapp} target="_blank" rel="noreferrer">Enviar por WhatsApp</a>
          <a className="border border-ink/20 px-5 py-3 text-xs font-bold uppercase text-ink" href="/tracking">Ver tracking</a>
        </div>
        {error && <p role="status" className="mt-3 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-8 md:grid-cols-[1fr_380px]">
      <section className="space-y-6">
        <Panel title="Informacion personal">
          <Field name="full_name" label="Nombre completo" required />
          <Field name="id_number" label="Numero de cedula" required />
          <Field name="phone" label="Teléfono de Costa Rica (8 dígitos o +506)" type="tel" required />
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
          {Object.entries(paymentLabels).map(([value, label]) => (
            <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${payment === value ? "border-wine bg-cream text-wine" : "border-ink/15"}`}>
              <input type="radio" name="payment_method" value={value} checked={payment === value} onChange={() => setPayment(value as PaymentMethod)} />
              {label}{value === "sinpe" ? " · 8603-7873" : ""}
            </label>
          ))}
          <p className="text-sm leading-6 text-ink/70">{paymentInstructions(payment)}</p>
          {(payment === "sinpe" || payment === "bac") && <Field name="payment_reference" label="Referencia de transferencia (opcional)" />}
        </Panel>
        <div className="rounded-2xl border border-wine/20 bg-cream p-5">
          <p className="font-editorial text-3xl text-deepwine">Reserva temporal</p>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Al generar la orden, reservamos las prendas disponibles. Coordinaremos contigo el pago y la entrega según el método que elijas.
          </p>
        </div>
      </section>
      <aside className="h-fit rounded border border-ink/10 bg-warmwhite p-6">
        <h2 className="font-editorial text-3xl">Resumen</h2>
        {!lines.length && <p className="mt-4 text-sm">Tu carrito está vacío. <a href="/#shop" className="text-wine underline">Ver prendas</a></p>}
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
        {error && <div role="alert" className="mt-5 rounded border border-wine/25 bg-cream p-4 text-sm text-wine">{error}</div>}
        <button disabled={loading || lines.length === 0} aria-busy={loading} className="mt-6 w-full bg-wine px-5 py-4 text-xs font-bold uppercase tracking-[0.24em] text-cream disabled:bg-warmgray">
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
