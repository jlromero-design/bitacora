"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brujula, Menu } from "@/components/icons";
import { MENU_PRINCIPAL } from "./nav-items";
import { DualClock } from "./dual-clock";
import { AlertsBell } from "./alerts-bell";
import { useUI } from "@/lib/ui";
import { createClient } from "@/lib/supabase/client";

export function FloatingHeader() {
  const [compact, setCompact] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { setMenuOpen } = useUI();

  async function cerrarSesion() {
    try { await createClient().auth.signOut(); } catch { /* sin sesión */ }
    router.push("/auth/login");
    router.refresh();
  }

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 px-3 pt-3"
      role="banner"
    >
      <div
        className={`glass-strong mx-auto flex max-w-5xl items-center gap-3 rounded-2xl border border-[var(--hairline)] px-4 transition-all duration-300 ${
          compact ? "py-2 shadow-[var(--sombra-md)]" : "py-3 shadow-[var(--sombra-lg)]"
        }`}
        style={{ boxShadow: "var(--sombra-md), inset 0 1px 0 rgba(224,192,116,0.08)" }}
      >
        {/* Sello */}
        <Link
          href="/agenda"
          className="flex items-center gap-3 text-laton"
          aria-label="Vale Juri, inicio"
        >
          <span
            className={`grid place-items-center rounded-full border border-[var(--hairline)] bg-[var(--tinta)] text-laton transition-all duration-300 ${
              compact ? "h-8 w-8" : "h-10 w-10"
            }`}
          >
            <Brujula width={compact ? 18 : 22} height={compact ? 18 : 22} />
          </span>
          <span className="leading-none">
            <span
              className="metal-text block font-display font-bold tracking-[0.14em]"
              style={{ fontSize: compact ? "1rem" : "1.15rem" }}
            >
              VALE JURI
            </span>
            {!compact && (
              <span className="mt-1 block">
                <DualClock />
              </span>
            )}
          </span>
        </Link>

        {/* Nav principal — escritorio */}
        <nav
          className="ml-auto hidden items-center gap-1 md:flex"
          aria-label="Menú principal"
        >
          {MENU_PRINCIPAL.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[var(--laton-tenue)] text-laton-claro"
                    : "text-gris-azul hover:text-marfil"
                }`}
              >
                <Icon width={17} height={17} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Campanita de alertas */}
        <div className="ml-auto md:ml-1">
          <AlertsBell />
        </div>

        {/* Logout — solo escritorio */}
        <button
          type="button"
          onClick={cerrarSesion}
          className="hidden md:grid h-9 w-9 place-items-center rounded-xl text-gris-azul hover:bg-[var(--tinta-3)] hover:text-marfil"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>

        {/* Hamburguesa — solo mobile */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="md:hidden grid h-10 w-10 place-items-center rounded-xl text-gris-azul hover:bg-[var(--tinta-3)] hover:text-marfil"
          aria-label="Abrir menú"
        >
          <Menu />
        </button>
      </div>
    </header>
  );
}
