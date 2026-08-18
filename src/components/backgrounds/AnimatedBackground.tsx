"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/** Aurora + mesh gradient blobs. GPU-accelerated, purely decorative. */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="animate-drift-a absolute -top-40 left-1/4 h-[38rem] w-[38rem] rounded-full bg-brand-1/20 blur-[120px]" />
      <div className="animate-drift-b absolute -right-32 top-24 h-[34rem] w-[34rem] rounded-full bg-brand-2/20 blur-[130px]" />
      <div className="animate-drift-a absolute -bottom-48 left-0 h-[30rem] w-[30rem] rounded-full bg-brand-3/12 blur-[140px]" />
    </div>
  );
}

/** Animated dotted grid with a soft radial fade. */
export function GridBackground({
  variant = "lines",
}: {
  variant?: "lines" | "dots";
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0 opacity-60",
          variant === "lines" ? "grid-lines" : "dot-grid",
        )}
        style={{
          maskImage: "radial-gradient(70% 60% at 50% 30%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(70% 60% at 50% 30%, black, transparent)",
        }}
      />
    </div>
  );
}

/** Subtle film-grain noise overlay. */
export function NoiseOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-soft-light"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

/** Animated SVG waves used as section dividers / hero floors. */
export function WaveBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 overflow-hidden opacity-40"
      aria-hidden
    >
      <svg
        viewBox="0 0 1440 320"
        className="h-full w-[200%] animate-marquee"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--brand-1)" stopOpacity="0.18" />
            <stop offset="50%" stopColor="var(--brand-2)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--brand-3)" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path
          fill="url(#waveGrad)"
          d="M0,192L60,181.3C120,171,240,149,360,160C480,171,600,213,720,213.3C840,213,960,171,1080,154.7C1200,139,1320,149,1380,154.7L1440,160L1440,320L0,320Z"
        />
      </svg>
    </div>
  );
}

/** Lightweight canvas particle field (connection/network lines). */
export function ParticleField({ density = 46 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const points = Array.from({ length: density }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
      }
      for (let i = 0; i < points.length; i++) {
        const a = points[i]!;
        const ax = a.x * width;
        const ay = a.y * height;
        ctx.beginPath();
        ctx.arc(ax, ay, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(160, 235, 245, 0.55)";
        ctx.fill();
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j]!;
          const bx = b.x * width;
          const by = b.y * height;
          const dist = Math.hypot(ax - bx, ay - by);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = `rgba(140, 220, 235, ${0.14 * (1 - dist / 140)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-70"
    />
  );
}

/** Mouse-follow radial glow. */
export function MouseGlow() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      el.style.setProperty("--mx", `${e.clientX}px`);
      el.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 hidden md:block"
      style={{
        background:
          "radial-gradient(340px circle at var(--mx, 50%) var(--my, 30%), color-mix(in oklab, var(--brand-1) 12%, transparent), transparent 70%)",
      }}
    />
  );
}

/** Floating wireframe / geometric objects. */
export function FloatingShapes() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <svg
        className="animate-float absolute left-[8%] top-[18%] h-24 w-24 text-brand-1/40"
        viewBox="0 0 100 100"
        fill="none"
      >
        <rect
          x="16"
          y="16"
          width="68"
          height="68"
          stroke="currentColor"
          strokeWidth="1.5"
          transform="rotate(18 50 50)"
        />
        <rect
          x="30"
          y="30"
          width="40"
          height="40"
          stroke="currentColor"
          strokeWidth="1"
          transform="rotate(-12 50 50)"
        />
      </svg>
      <svg
        className="animate-spin-slow absolute right-[10%] top-[30%] h-32 w-32 text-brand-2/35"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="6 10"
        />
        <circle cx="50" cy="50" r="26" stroke="currentColor" strokeWidth="1" />
      </svg>
      <div className="animate-blob absolute bottom-[12%] right-[22%] h-28 w-28 bg-brand-3/15 blur-2xl" />
    </div>
  );
}
