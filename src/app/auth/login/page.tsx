"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Brujula } from "@/components/icons";
import { inputClase } from "@/components/ui";
import { LoginBiometrico } from "@/components/boton-biometrico";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      router.push("/agenda");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="carta borde-metal w-full max-w-sm rounded-2xl p-7 animar-subir">

        {/* Logo con destello mágico */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="logo-destello-contenedor h-14 w-14">
            <span className="chispa" />
            <span className="chispa" />
            <span className="chispa" />
            <span className="grid h-full w-full place-items-center rounded-full border border-[var(--hairline)] bg-[var(--tinta)] text-laton">
              <Brujula width={30} height={30} />
            </span>
          </div>
          <h1 className="metal-text font-display text-xl font-bold tracking-[0.14em]">VALE JURI</h1>
          <p className="font-serif text-sm italic text-gris-azul">tu bitácora de viaje</p>
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-3">
          <label className="block">
            <span className="mb-1 block font-display text-[0.65rem] uppercase tracking-[0.12em] text-gris-azul">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              className={inputClase}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-display text-[0.65rem] uppercase tracking-[0.12em] text-gris-azul">Contraseña</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              className={inputClase}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-[var(--finanzas-bg)] px-3 py-2 text-xs text-finanzas">{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="btn-oro mt-1 min-h-[44px] rounded-xl px-4 py-2.5 font-semibold disabled:opacity-60"
          >
            {cargando ? "Un momento…" : "Entrar"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--hairline-soft)]" />
          <span className="font-display text-[0.6rem] uppercase tracking-[0.15em] text-gris-azul-dim">o</span>
          <div className="h-px flex-1 bg-[var(--hairline-soft)]" />
        </div>

        <LoginBiometrico
          email={email}
          onError={(msg) => setError(msg || null)}
        />

      </div>
    </main>
  );
}
