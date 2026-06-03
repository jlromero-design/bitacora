"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/ui";
import { Huella, Persona } from "@/components/icons";
import { RegistrarDispositivo } from "@/components/boton-biometrico";
import { listarCredenciales, eliminarCredencial } from "@/app/auth/webauthn-acciones";

type Credencial = {
  id: string;
  device_name: string;
  device_type: string | null;
  backed_up: boolean;
  created_at: string;
  last_used_at: string | null;
};

function formatearFecha(iso: string | null) {
  if (!iso) return "Nunca";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export default function PerfilPage() {
  const [creds, setCreds] = useState<Credencial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    const resultado = await listarCredenciales();
    if ("error" in resultado) {
      setError(resultado.error as string);
    } else {
      setCreds(resultado.credentials as Credencial[]);
    }
    setCargando(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function borrar(id: string) {
    setEliminando(id);
    const resultado = await eliminarCredencial(id);
    if ("error" in resultado) {
      setError(resultado.error as string);
    } else {
      setCreds((prev) => prev.filter((c) => c.id !== id));
    }
    setEliminando(null);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-6">
      <PageHeader
        titulo="Perfil"
        sub="Ajustes de acceso y dispositivos biométricos"
      />

      {/* Sección biométrico */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-laton">
          <Huella width={16} height={16} />
          <span className="font-display text-[0.7rem] uppercase tracking-[0.18em]">
            Acceso biométrico
          </span>
        </div>

        <p className="text-sm text-gris-azul">
          Registrá la huella dactilar, Face ID o Windows Hello de este dispositivo para
          entrar sin contraseña la próxima vez.
        </p>

        {error && (
          <p className="rounded-lg bg-[var(--finanzas-bg)] px-3 py-2 text-xs text-finanzas">
            {error}
          </p>
        )}

        <RegistrarDispositivo onRegistrado={cargar} />

        {/* Lista de dispositivos */}
        {cargando ? (
          <p className="text-sm text-gris-azul">Cargando dispositivos…</p>
        ) : creds.length === 0 ? (
          <p className="rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta-2)] px-4 py-3 text-sm text-gris-azul">
            Sin dispositivos biométricos registrados todavía.
          </p>
        ) : (
          <ul className="space-y-2">
            {creds.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta-2)] px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-laton shrink-0">
                    <Huella width={18} height={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm text-marfil">
                      {c.device_name}
                    </p>
                    <p className="text-xs text-gris-azul">
                      Último uso: {formatearFecha(c.last_used_at)}
                    </p>
                    <p className="text-xs text-gris-azul-dim">
                      Registrado: {formatearFecha(c.created_at)}
                      {c.backed_up && " · sincronizado"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => borrar(c.id)}
                  disabled={eliminando === c.id}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-gris-azul hover:bg-[var(--finanzas-bg)] hover:text-finanzas transition-colors disabled:opacity-50"
                >
                  {eliminando === c.id ? "…" : "Eliminar"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Separador */}
      <div className="h-px bg-[var(--hairline-soft)]" />

      {/* Info de cuenta */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-laton">
          <Persona width={16} height={16} />
          <span className="font-display text-[0.7rem] uppercase tracking-[0.18em]">
            Cuenta
          </span>
        </div>
        <p className="text-sm text-gris-azul">
          Para cambiar tu email o contraseña, usá el panel de Supabase o contactá al
          administrador del sistema.
        </p>
      </section>
    </div>
  );
}
