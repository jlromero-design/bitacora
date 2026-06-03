"use client";

import { useState } from "react";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { Huella } from "@/components/icons";
import {
  iniciarRegistro,
  completarRegistro,
  iniciarAutenticacion,
  completarAutenticacion,
} from "@/app/auth/webauthn-acciones";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// ── Botón de login biométrico ───────────────────────────────────────────────

interface LoginBiometricoProps {
  email: string;
  onError: (msg: string) => void;
}

export function LoginBiometrico({ email, onError }: LoginBiometricoProps) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function entrar() {
    if (!email.trim()) {
      onError("Ingresá tu email primero para usar el acceso biométrico.");
      return;
    }
    setCargando(true);
    onError("");
    try {
      const inicio = await iniciarAutenticacion(email);
      if ("error" in inicio) {
        onError(inicio.error as string);
        return;
      }

      let assertion;
      try {
        assertion = await startAuthentication({ optionsJSON: inicio.options });
      } catch {
        onError("Autenticación biométrica cancelada o no disponible.");
        return;
      }

      const resultado = await completarAutenticacion(assertion, email);
      if ("error" in resultado) {
        onError(resultado.error as string);
        return;
      }

      // Usar el token emitido por el servidor para crear la sesión
      const supabase = createClient();
      const { error: otpErr } = await supabase.auth.verifyOtp({
        email,
        token: resultado.token,
        type: "email",
      });

      if (otpErr) {
        onError(otpErr.message);
        return;
      }

      router.push("/agenda");
      router.refresh();
    } finally {
      setCargando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={entrar}
      disabled={cargando}
      title="Entrar con huella o reconocimiento facial"
      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--tinta-2)] px-4 py-2.5 text-sm text-gris-azul transition-colors hover:border-[var(--laton)] hover:text-marfil disabled:opacity-50"
    >
      <Huella width={18} height={18} />
      {cargando ? "Verificando…" : "Entrar con huella / rostro"}
    </button>
  );
}

// ── Botón de registro biométrico (en ajustes/perfil) ───────────────────────

interface RegistrarDispositivoProps {
  onRegistrado: () => void;
}

export function RegistrarDispositivo({ onRegistrado }: RegistrarDispositivoProps) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);

  async function registrar() {
    if (!nombre.trim()) { setError("Poné un nombre para identificar el dispositivo."); return; }
    setCargando(true);
    setError(null);
    try {
      const inicio = await iniciarRegistro();
      if ("error" in inicio) { setError(inicio.error as string); return; }

      let credential;
      try {
        credential = await startRegistration({ optionsJSON: inicio.options });
      } catch {
        setError("Registro biométrico cancelado o no disponible en este dispositivo.");
        return;
      }

      const resultado = await completarRegistro(credential, nombre);
      if ("error" in resultado) { setError(resultado.error as string); return; }

      setNombre("");
      setMostrarForm(false);
      onRegistrado();
    } finally {
      setCargando(false);
    }
  }

  if (!mostrarForm) {
    return (
      <button
        type="button"
        onClick={() => setMostrarForm(true)}
        className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--tinta-2)] px-4 py-2.5 text-sm text-gris-azul transition-colors hover:border-[var(--laton)] hover:text-marfil"
      >
        <Huella width={18} height={18} />
        Agregar dispositivo biométrico
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--tinta-2)] p-4">
      <p className="font-display text-[0.65rem] uppercase tracking-[0.12em] text-gris-azul">
        Nombre del dispositivo
      </p>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="ej. iPhone de Vale, MacBook…"
        className="rounded-lg border border-[var(--hairline-soft)] bg-[var(--tinta)] px-3 py-2 text-sm text-marfil placeholder-[var(--gris-azul-dim)] outline-none focus:border-[var(--laton)]"
        autoFocus
      />
      {error && (
        <p className="rounded-lg bg-[var(--finanzas-bg)] px-3 py-2 text-xs text-finanzas">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={registrar}
          disabled={cargando}
          className="btn-oro flex-1 min-h-[44px] rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {cargando ? "Registrando…" : "Registrar con biométrico"}
        </button>
        <button
          type="button"
          onClick={() => { setMostrarForm(false); setError(null); }}
          className="btn-ghost-metal min-h-[44px] rounded-xl px-4 py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
