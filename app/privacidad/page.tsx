export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 md:px-8">
      <p className="text-xs uppercase text-wine">Origin Studios</p>
      <h1 className="mt-3 font-editorial text-5xl text-deepwine">Privacidad y cookies</h1>
      <p className="mt-5 text-sm leading-7 text-ink/75">
        Esta página resume cómo Origin Studios usa cookies y datos personales dentro de la tienda.
        Debe revisarse con asesoría legal antes de publicar la tienda en producción.
      </p>

      <section className="mt-10 space-y-8">
        <PolicyBlock title="Cookies necesarias">
          Usamos cookies o almacenamiento local necesario para funciones básicas como mantener el carrito,
          recordar tu preferencia de cookies y permitir el funcionamiento seguro del checkout.
        </PolicyBlock>

        <PolicyBlock title="Cookies opcionales">
          Si más adelante se agregan herramientas de medición, analítica o publicidad, solo deberían activarse
          después de que el cliente acepte cookies opcionales.
        </PolicyBlock>

        <PolicyBlock title="Datos de compra">
          Para procesar pedidos solicitamos nombre, cédula, teléfono, dirección de entrega, método de pago y
          referencia de transferencia cuando aplique. Estos datos se usan para preparar, verificar y entregar la orden.
        </PolicyBlock>

        <PolicyBlock title="Pagos">
          Los pagos por SINPE Móvil o transferencia BAC se verifican manualmente. Origin Studios no solicita
          contraseñas bancarias, PIN, claves dinámicas ni datos completos de tarjetas.
        </PolicyBlock>

        <PolicyBlock title="Contacto">
          Para solicitudes de privacidad o eliminación de datos, el cliente puede contactar a Origin Studios por
          Instagram en @originstudios.cr o por los medios oficiales que se configuren en la tienda.
        </PolicyBlock>
      </section>
    </main>
  );
}

function PolicyBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="border-l-4 border-wine bg-warmwhite p-6">
      <h2 className="font-editorial text-3xl text-deepwine">{title}</h2>
      <p className="mt-3 leading-7 text-ink/75">{children}</p>
    </article>
  );
}
