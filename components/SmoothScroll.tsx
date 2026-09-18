"use client";

import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    let lenis: unknown = null;
    let rafId = 0;

    (async () => {
      try {
        // Prefer new package name, fallback to old scoped name
        let LenisMod: unknown;
        try {
          LenisMod = await import("lenis");
        } catch {
          LenisMod = await import("@studio-freight/lenis");
        }
        const Lenis = (LenisMod as { default: new (opts: unknown) => unknown }).default;

        const instance = new (Lenis as new (o: Record<string, unknown>) => {
          raf: (t: number) => void;
          destroy: () => void;
        })({
          duration: 1.1,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.5,
        });

        lenis = instance;

        const raf = (time: number) => {
          (instance as { raf: (t: number) => void }).raf(time);
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);
      } catch {
        // Lenis failed — native scroll remains
      }
    })();

    return () => {
      cancelAnimationFrame(rafId);
      if (lenis && typeof (lenis as { destroy?: () => void }).destroy === "function") {
        (lenis as { destroy: () => void }).destroy();
      }
    };
  }, []);

  return null;
}
