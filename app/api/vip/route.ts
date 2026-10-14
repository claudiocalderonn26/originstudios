import { NextResponse } from "next/server";
import { z } from "zod";
import { adminSupabase } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")).nullable()
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Revisa tu nombre y WhatsApp." }, { status: 400 });

  const supabase = adminSupabase();
  const { error } = await supabase.from("vip_waitlist").upsert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email || null
  }, { onConflict: "phone" });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
