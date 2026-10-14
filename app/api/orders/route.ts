import { NextResponse } from "next/server";
import { z } from "zod";
import { adminSupabase } from "@/lib/supabase";
import { sendOrderNotifications } from "@/lib/order-notifications";

const schema = z.object({
  customer: z.object({
    full_name: z.string().min(3),
    id_number: z.string().min(5),
    phone: z.string().min(8),
    email: z.string().email(),
    province: z.string().min(2),
    canton: z.string().min(2),
    district: z.string().min(2),
    address: z.string().min(8),
    notes: z.string().optional().nullable(),
    payment_reference: z.string().optional().nullable()
  }),
  paymentMethod: z.enum(["sinpe", "bac"]),
  items: z.array(z.object({ variantId: z.string().uuid(), quantity: z.number().int().positive() })).min(1)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Revisa los datos del pedido." }, { status: 400 });

  const supabase = adminSupabase();
  const { data, error } = await supabase.rpc("create_store_order", {
    order_payload: parsed.data
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const orderNumber = (data as { orderNumber?: string } | null)?.orderNumber;
  let notifications = { email: "skipped", whatsapp: "skipped" };

  if (orderNumber) {
    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, phone, email, province, canton, district, address, total_crc, payment_method")
      .eq("order_number", orderNumber)
      .single();

    if (order) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, brand_name, size, quantity, line_total_crc")
        .eq("order_id", order.id);

      notifications = await sendOrderNotifications(order, items || []);
    }
  }

  return NextResponse.json({ ...(data as object), notifications });
}
