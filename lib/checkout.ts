import { z } from "zod";

export const paymentLabels = {
  sinpe: "SINPE Móvil", bac: "Transferencia BAC", efectivo: "Efectivo", contra_entrega: "Pago contra entrega"
} as const;
export type PaymentMethod = keyof typeof paymentLabels;

export function paymentInstructions(method: string) {
  switch (method) {
    case "efectivo": return "Paga en efectivo al recibir tu compra. Coordinaremos contigo el lugar de entrega y el monto final.";
    case "contra_entrega": return "Paga al recibir tu pedido. Coordinaremos contigo la cobertura, el costo de envío y la entrega antes de despacharlo.";
    case "bac": return "Escríbenos por WhatsApp para recibir los datos de la cuenta BAC. Incluye tu número de orden en la transferencia.";
    default: return "Realiza el SINPE Móvil al 8603-7873 e incluye tu número de orden en el detalle. Confirmaremos el pago al verificarlo.";
  }
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("506") ? digits.slice(3) : digits;
}

const text = (label: string, min: number, max = 150) => z.string().trim().min(min, `${label}: escribe al menos ${min} caracteres.`).max(max, `${label}: el texto es demasiado largo.`);
export const orderSchema = z.object({
  requestId: z.string({ required_error: "Actualiza la página e intenta de nuevo." }).uuid("Actualiza la página e intenta de nuevo."),
  customer: z.object({
    full_name: text("Nombre completo", 3), id_number: text("Identificación", 5, 30),
    phone: z.string().transform(normalizePhone).pipe(z.string().regex(/^[2-9]\d{7}$/, "Teléfono: ingresa 8 dígitos de Costa Rica; puedes incluir +506.")),
    email: z.string().trim().toLowerCase().email("Correo: ingresa una dirección válida.").max(254),
    province: text("Provincia", 2), canton: text("Cantón", 2), district: text("Distrito", 2),
    address: text("Dirección exacta", 8, 1000),
    notes: z.string().trim().max(1000).optional().nullable(), payment_reference: z.string().trim().max(150).optional().nullable()
  }),
  paymentMethod: z.enum(["sinpe", "bac", "efectivo", "contra_entrega"]),
  items: z.array(z.object({
    variantId: z.string().min(1).max(200), slug: z.string().min(1).max(200).optional(), size: z.string().min(1).max(20).optional(),
    quantity: z.number().int().min(1).max(99)
  })).min(1, "Tu carrito está vacío.").max(100)
});

export type OrderInput = z.infer<typeof orderSchema>;
type AvailableProduct = { slug: string; is_active: boolean; price_crc: number; variants: { id: string; size: string; stock: number }[] };

// Resolve legacy/demo IDs against live inventory; never accept browser prices.
export function resolveOrderItems(items: OrderInput["items"], products: AvailableProduct[]) {
  const resolved = new Map<string, { variantId: string; quantity: number; stock: number }>();
  for (const item of items) {
    const product = products.find(p => p.variants.some(v => v.id === item.variantId)) || products.find(p => p.slug === item.slug);
    const variant = product?.variants.find(v => v.id === item.variantId) || product?.variants.find(v => v.size.toUpperCase() === item.size?.toUpperCase());
    if (!product?.is_active || !variant) throw new Error("Una prenda o talla ya no está disponible. Retírala del carrito y vuelve a seleccionarla.");
    if (product.price_crc <= 0) throw new Error("Una prenda aún no tiene precio confirmado. Escríbenos para ayudarte.");
    const quantity = (resolved.get(variant.id)?.quantity || 0) + item.quantity;
    if (quantity > variant.stock) throw new Error(`La talla ${variant.size} no tiene suficientes unidades. Ajusta la cantidad del carrito.`);
    resolved.set(variant.id, { variantId: variant.id, quantity, stock: variant.stock });
  }
  return [...resolved.values()].map(({ variantId, quantity }) => ({ variantId, quantity }));
}
