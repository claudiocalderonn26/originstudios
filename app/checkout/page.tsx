import { CheckoutForm } from "@/components/CheckoutForm";

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <p className="text-xs uppercase tracking-[0.28em] text-warmgray">Checkout</p>
      <h1 className="mt-3 font-editorial text-5xl">Confirmar pedido</h1>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </main>
  );
}
