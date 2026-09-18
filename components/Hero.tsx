"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let ctx: gsap.Context | null = null;

    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      ctx = gsap.context(() => {
        const lines = gsap.utils.toArray<HTMLElement>(".hero-line-inner");
        gsap.fromTo(
          lines,
          { yPercent: 105 },
          {
            yPercent: 0,
            duration: 1.15,
            ease: "power4.out",
            stagger: 0.09,
            delay: 0.15,
          }
        );

        gsap.fromTo(
          ".hero-fade",
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            delay: 0.9,
          }
        );

        gsap.to(headlineRef.current, {
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }, rootRef);
      mod.ScrollTrigger.refresh();
    });

    return () => ctx?.revert();
  }, []);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    if (window.innerWidth < 768) return;

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      gsap.to(el, { x, y, duration: 0.9, ease: "power3.out", overwrite: "auto" });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative min-h-[100svh] flex flex-col justify-center bg-transparent overflow-hidden"
      aria-label="Hero"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 10%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(50% 50% at 90% 80%, rgba(255,255,255,0.03), transparent 60%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-8 pt-[96px] pb-12">
        <div className="hero-fade flex items-center gap-3 text-[10px] md:text-[11px] tracking-[0.2em] text-white/45 font-medium">
          <span className="h-px w-8 bg-white/20 hidden md:block" />
          AVAILABLE FOR NEW PROJECTS — 2026
        </div>

        <p className="hero-fade mt-6 md:mt-8 text-[11px] md:text-[12px] tracking-[0.22em] text-white/60 font-medium">
          HELLO, I&apos;M BERNARDO.
        </p>

        <h1
          ref={headlineRef}
          className="mt-4 md:mt-6 font-display font-[700] tracking-[-0.05em] leading-[0.88] text-white will-change-transform"
          style={{ fontSize: "clamp(42px, 10vw, 148px)" }}
        >
          <span className="block overflow-hidden">
            <span className="hero-line-inner block">I BUILD</span>
          </span>
          <span className="block overflow-hidden">
            <span className="hero-line-inner block text-white/90">DIGITAL</span>
          </span>
          <span className="block overflow-hidden">
            <span className="hero-line-inner block">EXPERIENCES.</span>
          </span>
        </h1>

        <div className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <p className="hero-fade max-w-[560px] text-[15px] md:text-[16px] leading-relaxed text-white/60">
            Informatics graduate with experience in developing web applications using React.js and
            Laravel. Skilled in responsive UI, backend systems, performance optimization, and software
            testing — including functional testing, bug identification, and UAT.
          </p>

          <div className="hero-fade flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a
              href="#work"
              className="group inline-flex items-center gap-3 rounded-full bg-white text-black px-7 md:px-8 h-[48px] md:h-[52px] text-[12px] md:text-[13px] tracking-[0.14em] font-semibold hover:bg-white/90 transition-colors"
            >
              VIEW MY WORK
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-white text-[12px] group-hover:translate-x-[2px] transition-transform">
                ↗
              </span>
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 h-[48px] md:h-[52px] text-[12px] tracking-[0.14em] font-medium text-white hover:bg-white hover:text-black transition-colors"
            >
              ABOUT ME ↓
            </a>
          </div>
        </div>
      </div>

      <div className="hero-fade absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="text-[9px] tracking-[0.22em] text-white/30">SCROLL</span>
        <span className="block h-[44px] w-px bg-gradient-to-b from-white/30 to-transparent" />
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-white/[0.06]" />
    </section>
  );
}
