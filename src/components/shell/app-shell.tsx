"use client";
import { StoreProvider } from "@/lib/store";
import { UIProvider } from "@/lib/ui";
import { FloatingHeader } from "./floating-header";
import { HamburgerMenu } from "./hamburger-menu";
import { Starfield } from "./starfield";
import { CollapsibleCalendar } from "@/components/calendar/collapsible-calendar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <UIProvider>
        <Starfield />
        <FloatingHeader />
        <HamburgerMenu />
        <main id="contenido" className="px-3 pb-24 pt-4">
          <div className="mx-auto flex max-w-5xl flex-col gap-4">
            <CollapsibleCalendar />
          </div>
          <div className="mt-4">{children}</div>
        </main>
        <footer className="px-4 pb-10 text-center" role="contentinfo">
          <p className="regla-ornamento mx-auto max-w-xs text-laton">✦ ⊙ ✦</p>
          <p className="mt-3 font-serif text-sm italic text-gris-azul-dim">
            Vale Juri · Jun–Ago 2026
          </p>
        </footer>
      </UIProvider>
    </StoreProvider>
  );
}
