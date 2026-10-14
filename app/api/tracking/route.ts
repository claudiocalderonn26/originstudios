import { NextResponse } from "next/server";
import { z } from "zod";
import { adminSupabase } from "@/lib/supabase";

const schema = z.object({
  orderNumber: z.string().min(6),
  phone: z.string().min(8)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });

  const supabase = adminSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("order_number, payment_status, fulfillment_status, total_crc, created_at, tracking_number")
    .eq("order_number", parsed.data.orderNumber.trim())
    .eq("phone", parsed.data.phone.trim())
    .single();

  if (error || !data) return NextResponse.json({ error: "No encontramos una orden con esos datos." }, { status: 404 });
  return NextResponse.json({ order: data });
}
