# Activar los pedidos actualizados

El código acepta SINPE, BAC, efectivo y pago contra entrega. Para activarlo en la tienda publicada hacen falta estos ajustes de infraestructura:

1. En el SQL Editor del proyecto Supabase `ffjvzacpcnmjzkyfbrlv`, ejecutar **todo** el archivo `supabase/migrations/004_checkout_reliability.sql`. Es una actualización sobre las migraciones 001–003 existentes; conserva inventario y pedidos. No volver a ejecutar el inventario inicial porque restablece las cantidades.
2. En Netlify, proyecto `originstudioscr` → configuración → variables de entorno, configurar `SUPABASE_SERVICE_ROLE_KEY` para producción y Functions usando la clave de servidor del proyecto. El valor actual para desarrollo está en `.env.local`; este archivo privado nunca se sube a GitHub. La URL y clave **pública** ya están incluidas en `netlify.toml`.
3. Volver a desplegar después de guardar las variables. Verificar una compra controlada y su reserva en Supabase; si se hace una compra real de prueba, cancelarla y devolver las unidades desde administración.

Los pedidos se guardan aunque falle el correo o WhatsApp. Para activar esos avisos, se necesitan `RESEND_API_KEY` y `ORDER_EMAIL_FROM` para correo, y `WHATSAPP_ACCESS_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID` para WhatsApp. Sin ellos, la pantalla confirma la orden guardada pero no afirma que se envió un correo.

## Comprobaciones locales

`npm test` ejecuta PostgreSQL en memoria con PGlite: no consume stock, no crea pedidos reales y no envía mensajes. Prueba los cuatro pagos, reservas, reintentos, cantidades inválidas, prendas inactivas y permisos de la función.

`npm run typecheck` y `npm run build` verifican tipos y compilación.

El catálogo se actualiza cada 60 segundos y se invalida cuando se guarda un producto o una orden. El checkout vuelve a comprobar precio y stock en la base real. Si Supabase no responde, el catálogo de respaldo no anuncia cantidades ficticias.
