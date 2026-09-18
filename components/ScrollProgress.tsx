"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let ctx: gsap.Context | null = null;
    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.set(barRef.current, { scaleX: 0, transformOrigin: "0 0" });
        gsap.to(barRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.35,
          },
        });
      });
    });
    return () => ctx?.revert();
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-0 inset-x-0 z-[100] h-[2px]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-violet-400/50 via-sky-400/40 to-white/50 blur-[1px] opacity-70" />
      <div
        ref={barRef}
        className="relative h-full w-full origin-left bg-white will-change-transform"
        style={{ transformOrigin: "0 0" }}
      />
    </div>
  );
}
