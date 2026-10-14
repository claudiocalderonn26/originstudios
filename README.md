# Origin Studios Store

Tienda e-commerce para ORIGIN STUDIOS con frontend en Next.js, Supabase como base de datos/Auth/Storage y flujo de checkout para SINPE Móvil o transferencia BAC.

## Incluye

- Home editorial premium con catálogo dinámico.
- Página individual de producto con tallas y estado sold out.
- Carrito lateral persistente en el navegador.
- Checkout con datos de cliente, entrega, SINPE/BAC y creación real de orden.
- API server-side que valida el pedido contra Supabase.
- Migración SQL con productos, marcas, categorías, variantes, inventario, pedidos, items, tarifas de envío, comprobantes y configuración.
- Función transaccional `create_store_order` que descuenta inventario con bloqueo para evitar vender la última unidad dos veces.
- Panel `/admin` inicial para métricas y pedidos, protegido por Supabase Auth y el correo autorizado.
- Carga rápida de productos desde `/admin` con tallas S/M/L/XL y stock por talla.
- Banner de consentimiento de cookies con aceptar/rechazar y página `/privacidad`.
- Ficha editorial de producto con curaduría, fit, disponibilidad y guía de tallas preparada.
- Reserva temporal indicada en checkout y post-compra.
- Pantalla post-compra con resumen, confirmacion por correo, aviso automatico por WhatsApp y acceso a tracking.
- Página `/tracking` para consultar pedidos con número de orden + teléfono.
- Lista VIP de acceso anticipado para drops.
- `.env.example`, `netlify.toml` y guía de despliegue.

## Configuración local

1. Instala dependencias:

```bash
npm install
```

2. Copia variables:

```bash
cp .env.example .env.local
```

3. Crea un proyecto en Supabase y llena:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=claudiocalderonn26@gmail.com
```

4. Ejecuta las migraciones SQL en orden desde `supabase/migrations/` en el SQL editor de Supabase.

5. Inicia:

```bash
npm run dev
```

## Supabase

Crear buckets en Storage:

- `product-images`
- `payment-proofs`
- `store-assets`

Activar Supabase Auth y permitir únicamente el administrador inicial:

- `claudiocalderonn26@gmail.com`

El panel `/admin` ya usa middleware de Supabase Auth y solo permite el correo configurado en `ADMIN_EMAIL`. La pantalla `/login` envía un enlace mágico al correo autorizado.

## Datos de pago

SINPE queda inicializado con:

- `8603-7873`

Los datos BAC se guardan en `store_settings.payment_bac` para que no se editen desde código.

## Envíos

Las tarifas se administran en `shipping_rates`. Si no existe tarifa para una zona, el checkout deja el envío como pendiente de cotización y no inventa un monto.

## Netlify

1. Sube este proyecto a GitHub.
2. Crea un nuevo sitio en Netlify.
3. Usa:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Instala el plugin oficial `@netlify/plugin-nextjs` si Netlify no lo detecta automáticamente.
5. Configura las variables de entorno del `.env.example`.

## Confirmaciones automaticas

Cuando se crea una orden, la API intenta enviar:

- Email al correo del cliente con numero de orden, prendas y total.
- WhatsApp automatico a `50686037873` con numero de orden, cliente, total y prendas.

Para activar el email, configura en produccion:

```bash
RESEND_API_KEY=
ORDER_EMAIL_FROM=Origin Studios <orders@tudominio.com>
```

Para activar WhatsApp automatico necesitas WhatsApp Business Cloud API de Meta:

```bash
ORDER_WHATSAPP_TO=50686037873
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_API_VERSION=v21.0
```

Si estas variables no estan configuradas, la orden se crea normalmente y el checkout no se cae; solo se omite la notificacion automatica.

## Dominio originstudios.cr

En Netlify:

1. Abre Site settings.
2. Domain management.
3. Add custom domain: `originstudios.cr`.
4. Sigue los DNS que Netlify indique.
5. Activa HTTPS cuando Netlify termine la verificación.

## Próximos pasos recomendados

- Conectar Supabase Auth en `/admin` con sesión real.
- Crear formularios CRUD para productos, imágenes, variantes, tarifas y settings.
- Completar edición/archivo/eliminación de productos desde el panel.
- Añadir subida de comprobantes a `payment-proofs`.
- Añadir consulta privada de pedido usando `order_number` + `verification_token`.
- Añadir exportación CSV desde `/admin`.
