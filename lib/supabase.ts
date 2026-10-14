import { createClient } from "@supabase/supabase-js";
import { createClient as createBrowserSupabase } from "@/utils/supabase/client";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function browserSupabase() {
  return createBrowserSupabase();
}

export function adminSupabase() {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) throw new Error("Missing server Supabase environment variables.");
  return createClient(url, service, { auth: { persistSession: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) } });
}

export function publicSupabase() {
  if (!url || !publishable) throw new Error("Missing public Supabase environment variables.");
  return createClient(url, publishable, { auth: { persistSession: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) } });
}
