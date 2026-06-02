"use client";
/* ════════════════════════════════════════════════════════════
   Destellos dorados — partículas tipo polvo de estrellas, muy
   suaves, detrás del contenido. Respeta prefers-reduced-motion.
   ════════════════════════════════════════════════════════════ */
import { useEffect, useRef } from "react";

interface Estrella {
  x: number;
  y: number;
  r: number;        // radio
  base: number;     // opacidad base
  amp: number;      // amplitud del titileo
  vel: number;      // velocidad del titileo
  fase: number;     // desfase inicial
  drift: number;    // deriva vertical lentísima
}

const COLOR = "224, 192, 116"; // latón claro (rgb)

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let estrellas: Estrella[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;

    function crear() {
      // densidad proporcional al área, acotada
      const cantidad = Math.min(110, Math.round((w * h) / 14000));
      estrellas = Array.from({ length: cantidad }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.4,
        base: Math.random() * 0.25 + 0.06,
        amp: Math.random() * 0.35 + 0.15,
        vel: Math.random() * 0.0009 + 0.0003,
        fase: Math.random() * Math.PI * 2,
        drift: Math.random() * 0.04 + 0.01,
      }));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      crear();
    }

    function dibujar(t: number) {
      ctx!.clearRect(0, 0, w, h);
      for (const e of estrellas) {
        const titileo = reduce ? e.base + e.amp * 0.5 : e.base + e.amp * (0.5 + 0.5 * Math.sin(t * e.vel + e.fase));
        const op = Math.max(0, titileo);

        // halo difuso
        const grad = ctx!.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4);
        grad.addColorStop(0, `rgba(${COLOR}, ${op})`);
        grad.addColorStop(1, `rgba(${COLOR}, 0)`);
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2);
        ctx!.fill();

        // núcleo
        ctx!.fillStyle = `rgba(${COLOR}, ${Math.min(1, op * 1.6)})`;
        ctx!.beginPath();
        ctx!.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx!.fill();

        if (!reduce) {
          e.y -= e.drift;
          if (e.y < -4) {
            e.y = h + 4;
            e.x = Math.random() * w;
          }
        }
      }
      raf = requestAnimationFrame(dibujar);
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduce) {
      dibujar(0); // un solo cuadro estático
    } else {
      raf = requestAnimationFrame(dibujar);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: 0.9 }}
    />
  );
}
