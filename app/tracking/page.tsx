import { TrackingForm } from "@/components/TrackingForm";

export default function TrackingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <p className="text-xs uppercase text-wine">Origin Studios</p>
      <h1 className="mt-3 font-editorial text-6xl text-deepwine">Track your order</h1>
      <p className="mt-5 max-w-2xl leading-7 text-ink/75">
        Consulta el estado de pago, preparación y envío de tu pedido sin escribirnos por DM.
      </p>
      <div className="mt-10">
        <TrackingForm />
      </div>
    </main>
  );
}
