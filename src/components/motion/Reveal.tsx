"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "fade" | "up" | "down" | "left" | "right" | "zoom" | "blur";

const hidden: Record<Variant, string> = {
  fade: "opacity-0",
  up: "opacity-0 translate-y-8",
  down: "opacity-0 -translate-y-8",
  left: "opacity-0 -translate-x-8",
  right: "opacity-0 translate-x-8",
  zoom: "opacity-0 scale-95",
  blur: "opacity-0 blur-md",
};

export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/** Scroll-triggered reveal wrapper. */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        inView
          ? "translate-x-0 translate-y-0 scale-100 opacity-100 blur-0"
          : hidden[variant],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Staggered children reveal. */
export function Stagger({
  children,
  step = 80,
  variant = "up",
  className,
}: {
  children: ReactNode[];
  step?: number;
  variant?: Variant;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} variant={variant} delay={i * step}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}

/** Word-by-word text reveal for headlines. */
export function TextReveal({
  text,
  className,
  wordClassName,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {text.split(" ").map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="-mb-[0.16em] inline-block overflow-hidden pb-[0.16em] align-bottom"
        >
          <span
            className={cn(
              "inline-block transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              inView
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0",
              wordClassName,
            )}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            {word}
          </span>
          <span>&nbsp;</span>
        </span>
      ))}
    </span>
  );
}

/** Animated number counter. */
export function Counter({
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 1600,
  className,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** Magnetic hover wrapper for buttons/cards. */
export function Magnetic({
  children,
  strength = 14,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={ref}
      className="inline-block transition-transform duration-300 ease-out will-change-transform"
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
      }}
      onPointerLeave={() => {
        const el = ref.current;
        if (el) el.style.transform = "translate3d(0,0,0)";
      }}
    >
      {children}
    </div>
  );
}
