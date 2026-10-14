"use client";

import { useState } from "react";
import { browserSupabase } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("claudiocalderonn26@gmail.com");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Enviando enlace...");
    const supabase = browserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`
      }
    });
    setMessage(error ? error.message : "Revisa tu correo para entrar al panel.");
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded border border-ink/10 bg-warmwhite p-8">
      <h1 className="font-editorial text-5xl">Acceso admin</h1>
      <p className="mt-3 text-sm text-warmgray">Entrada privada para el propietario de Origin Studios.</p>
      <label className="mt-8 grid gap-2 text-sm">
        <span>Correo autorizado</span>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="border border-ink/15 bg-cream px-4 py-3 outline-none focus:border-wine" />
      </label>
      <button className="mt-6 w-full bg-ink px-5 py-4 text-xs font-bold uppercase tracking-[0.24em] text-cream">Enviar enlace seguro</button>
      {message ? <p className="mt-4 text-sm text-warmgray">{message}</p> : null}
    </form>
  );
}
