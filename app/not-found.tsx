export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-editorial text-6xl">404</h1>
      <p className="mt-4 text-warmgray">La página o prenda que buscas no está disponible.</p>
      <a href="/" className="mt-8 inline-block bg-ink px-6 py-4 text-xs font-bold uppercase tracking-[0.25em] text-cream">Volver al inicio</a>
    </main>
  );
}
