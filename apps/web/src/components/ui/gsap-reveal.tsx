"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type GsapRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Etiqueta del contenedor. Default: "div". */
  as?: React.ElementType;
  /** Separación entre elementos hijos animados (s). */
  stagger?: number;
  /** Retraso inicial (s). */
  delay?: number;
  /** Desplazamiento vertical inicial (px). */
  y?: number;
  /** Si true, solo anima en el primer mount. */
  once?: boolean;
  /** Duración de la animación (s). */
  duration?: number;
};

export function GsapReveal({
  children,
  className,
  as: Tag = "div",
  stagger = 0.08,
  delay = 0,
  y = 16,
  once = true,
  duration = 0.5,
}: GsapRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const played = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (once && played.current) return;
    played.current = true;

    const targets = node.children.length ? node.children : node;

    if (reduced) {
      gsap.set(targets, { opacity: 1, y: 0, clearProps: "transform" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(targets, { willChange: "transform" });
      gsap.fromTo(
        targets,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          stagger,
          ease: "power3.out",
          clearProps: "transform",
          overwrite: "auto",
          onComplete: () => gsap.set(targets, { willChange: "auto" }),
        }
      );
    }, node);

    return () => ctx.revert();
  }, [reduced, y, duration, delay, stagger, once]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
