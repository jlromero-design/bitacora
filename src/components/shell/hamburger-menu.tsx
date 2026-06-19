"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cerrar, Brujula } from "@/components/icons";
import { MENU_PRINCIPAL, MENU_SECUNDARIO } from "./nav-items";
import { useUI } from "@/lib/ui";
import { createClient } from "@/lib/supabase/client";

export function HamburgerMenu() {
  const { menuOpen, setMenuOpen } = useUI();
  const pathname = usePathname();
  const router = useRouter();

  async function cerrarSesion() {
    try {
      await createClient().auth.signOut();
    } catch {
      /* sin sesión activa */
    }
    setMenuOpen(false);
    router.push("/auth/login");
    router.refresh();
  }

  // Cerrar con Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, setMenuOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className={`glass-strong fixed right-0 top-0 z-[61] flex h-full w-[min(86vw,340px)] flex-col border-l border-[var(--hairline)] p-5 transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-laton">
            <Brujula width={22} height={22} />
            <span className="metal-text font-display text-lg font-bold tracking-[0.12em]">
              VALE JURI
            </span>
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-xl text-gris-azul hover:bg-[var(--tinta-3)] hover:text-marfil"
            aria-label="Cerrar menú"
          >
            <Cerrar />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1" aria-label="Secciones">
          <p className="px-3 pb-1 font-display text-[0.65rem] tracking-[0.2em] text-gris-azul-dim">
            PRINCIPAL
          </p>
          {MENU_PRINCIPAL.map(({ href, label, icon: Icon }) => (
            <MenuLink key={href} href={href} active={pathname.startsWith(href)} onNav={() => setMenuOpen(false)}>
              <Icon width={18} height={18} />
              {label}
            </MenuLink>
          ))}

          <p className="px-3 pb-1 pt-4 font-display text-[0.65rem] tracking-[0.2em] text-gris-azul-dim">
            CONFIGURACIÓN DEL VIAJE
          </p>
          {MENU_SECUNDARIO.map(({ href, label, icon: Icon }) => (
            <MenuLink key={href} href={href} active={pathname.startsWith(href)} onNav={() => setMenuOpen(false)}>
              <Icon width={18} height={18} />
              {label}
            </MenuLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-[var(--hairline-soft)] pt-4">
          <a
            href="/portfolio"
            onClick={() => setMenuOpen(false)}
            className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-marfil-dim hover:bg-tinta-3 hover:text-marfil"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
            Portfolio
          </a>
          <button
            type="button"
            onClick={cerrarSesion}
            className="w-full rounded-xl px-3 py-2 text-left text-sm text-gris-azul hover:bg-[var(--tinta-3)] hover:text-marfil"
          >
            Cerrar sesión
          </button>
          <p className="px-3 pt-2 font-serif text-xs italic text-gris-azul-dim">
            Que cada día sea una página que valga la pena leer.
          </p>
        </div>
      </div>
    </>
  );
}

function MenuLink({
  href,
  active,
  onNav,
  children,
}: {
  href: string;
  active: boolean;
  onNav: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNav}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
        active
          ? "bg-[var(--laton-tenue)] text-laton-claro"
          : "text-marfil-dim hover:bg-[var(--tinta-3)] hover:text-marfil"
      }`}
    >
      {children}
    </Link>
  );
}
