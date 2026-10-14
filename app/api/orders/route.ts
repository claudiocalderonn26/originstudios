import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { orderSchema, resolveOrderItems } from "@/lib/checkout";
import { adminSupabase } from "@/lib/supabase";
import { sendOrderNotifications } from "@/lib/order-notifications";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "El pedido no tiene un formato válido." }, { status: 400 });
  }
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  try {
  const supabase = adminSupabase();
  const { data: existing, error: lookupError } = await supabase.from("orders")
    .select("order_number, verification_token, total_crc, payment_method, shipping_status")
    .eq("checkout_request_id", parsed.data.requestId).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return NextResponse.json({ orderNumber: existing.order_number, verificationToken: existing.verification_token, total: existing.total_crc, paymentMethod: existing.payment_method, shippingStatus: existing.shipping_status, replayed: true });
  const { data: products, error: inventoryError } = await supabase.from("products")
    .select("slug, is_active, price_crc, variants:product_variants(id,size,stock)")
    .eq("is_active", true).abortSignal(AbortSignal.timeout(8000));
  if (inventoryError || !products) throw inventoryError || new Error("Inventory unavailable");
  let items;
  try { items = resolveOrderItems(parsed.data.items, products); } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 409 });
  }
  const { data, error } = await supabase.rpc("create_store_order", {
    order_payload: { ...parsed.data, items }
  });
  if (error) {
    if (error.code === "P0001") return NextResponse.json({ error: error.message }, { status: 409 });
    throw error;
  }
  if (!data?.orderNumber) throw new Error("Missing order confirmation");
  revalidateTag("products");

  const orderNumber = (data as { orderNumber?: string } | null)?.orderNumber;
  let notifications = { email: "skipped", whatsapp: "skipped" };

  const notificationsConfigured = (process.env.RESEND_API_KEY && process.env.ORDER_EMAIL_FROM) || (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  if (orderNumber && !data.replayed && notificationsConfigured) {
    try {
    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, phone, email, province, canton, district, address, total_crc, payment_method")
      .eq("order_number", orderNumber)
      .single().abortSignal(AbortSignal.timeout(5000));

    if (order) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, brand_name, size, quantity, line_total_crc")
        .eq("order_id", order.id).abortSignal(AbortSignal.timeout(5000));

      notifications = await sendOrderNotifications(order, items || []);
    }
    } catch { console.error("Order saved; notification delivery unavailable."); }
  }

  return NextResponse.json({ ...(data as object), notifications });
  } catch (error) {
    console.error("Checkout unavailable", { code: (error as { code?: string })?.code || "configuration_or_network" });
    return NextResponse.json({ error: "No pudimos conectar con la tienda. Tu carrito sigue guardado. Intenta nuevamente en un momento o escríbenos por WhatsApp." }, { status: 503 });
  }
}
