"use client";

// Central GSAP helpers — lightweight, no ScrollTrigger bundle by default.
import gsap from "gsap";

export function revealLines(selector: string, delay = 0) {
  const els = gsap.utils.toArray<HTMLElement>(selector);
  if (!els.length) return;
  gsap.fromTo(
    els,
    { yPercent: 105, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.08,
      delay,
      overwrite: true,
    }
  );
}

export function fadeUp(selector: string, opts?: gsap.TweenVars) {
  const els = gsap.utils.toArray<HTMLElement>(selector);
  if (!els.length) return;
  gsap.fromTo(
    els,
    { y: 24, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.07, ...opts }
  );
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
