import { NextResponse } from "next/server";
import { z } from "zod";
import { adminSupabase } from "@/lib/supabase";
import { normalizePhone } from "@/lib/checkout";

const schema = z.object({
  orderNumber: z.string().trim().toUpperCase().min(6),
  phone: z.string().transform(normalizePhone).pipe(z.string().regex(/^[2-9]\d{7}$/))
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });

  try {
  const supabase = adminSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("order_number, phone, payment_status, fulfillment_status, total_crc, created_at, tracking_number")
    .eq("order_number", parsed.data.orderNumber.trim())
    .single();

  if (error || !data || normalizePhone(data.phone) !== parsed.data.phone) return NextResponse.json({ error: "No encontramos una orden con esos datos." }, { status: 404 });
  const { phone, ...order } = data;
  return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "No pudimos consultar tu pedido. Intenta nuevamente en un momento." }, { status: 503 });
  }
}
