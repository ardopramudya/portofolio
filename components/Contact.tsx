"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Contact() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let ctx: gsap.Context | null = null;
    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".contact-eyebrow", {
          y: 18,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
        // Headline — split-like word stagger via spans
        gsap.from(".contact-word", {
          y: 44,
          opacity: 0,
          duration: 0.95,
          ease: "power4.out",
          stagger: 0.09,
          scrollTrigger: { trigger: ".contact-headline", start: "top 88%", once: true },
        });
        gsap.from(".contact-sub", {
          y: 18,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".contact-sub", start: "top 92%", once: true },
        });
        gsap.from(".contact-cta", {
          y: 20,
          opacity: 0,
          scale: 0.97,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".contact-ctas", start: "top 92%", once: true },
        });
        gsap.from(".contact-divider", {
          scaleX: 0,
          transformOrigin: "0 0",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: ".contact-divider", start: "top 95%", once: true },
        });
        gsap.from(".contact-links", {
          y: 16,
          opacity: 0,
          duration: 0.65,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: { trigger: ".contact-bottom", start: "top 95%", once: true },
        });
        // Headline parallax on scroll (subtle)
        gsap.fromTo(
          ".contact-headline",
          { yPercent: 2 },
          {
            yPercent: -3,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7,
            },
          }
        );
      }, ref);
    });
    return () => ctx?.revert();
  }, []);

  return (
    <section
      ref={ref}
      id="contact"
      className="relative bg-transparent border-t border-white/[0.06] overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-8 py-16 md:py-24 lg:py-28">
        <p className="contact-eyebrow text-[11px] tracking-[0.2em] text-white/40 font-medium">
          CONTACT — LET&apos;S TALK
        </p>

        <h2
          className="contact-headline mt-6 font-display font-bold tracking-[-0.05em] leading-[0.88] text-white will-change-transform"
          style={{ fontSize: "clamp(36px, 8vw, 108px)" }}
        >
          <span className="contact-word inline-block overflow-hidden">
            <span className="inline-block">HAVE&nbsp;A&nbsp;PROJECT</span>
          </span>
          <br />
          <span className="contact-word inline-block text-white/60 overflow-hidden">
            <span className="inline-block">IN&nbsp;MIND?</span>
          </span>
        </h2>

        <p className="contact-sub mt-6 max-w-[48ch] text-[15px] md:text-[16px] leading-relaxed text-white/50">
          Let&apos;s build something meaningful together.
        </p>

        <div className="contact-ctas mt-10 flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:ardoananta1@gmail.com"
            className="contact-cta will-change-transform inline-flex items-center justify-center gap-3 rounded-full bg-white text-black px-8 h-[52px] text-[13px] tracking-[0.14em] font-semibold hover:bg-white/90 transition-colors"
          >
            GET IN TOUCH
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-white text-xs">
              ↗
            </span>
          </a>
          <a
            href="mailto:ardoananta1@gmail.com"
            className="contact-cta will-change-transform inline-flex items-center justify-center rounded-full border border-white/15 px-8 h-[52px] text-[13px] tracking-[0.14em] font-medium text-white hover:bg-white hover:text-black transition-colors break-all"
          >
            ardoananta1@gmail.com
          </a>
        </div>

        <div className="contact-divider mt-14 h-px bg-white/[0.06] origin-left" />
        <div className="contact-bottom mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex flex-wrap gap-6">
            <a
              href="https://github.com/ardopramudya"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-links text-[12px] tracking-[0.16em] text-white/50 hover:text-white transition-colors"
            >
              GITHUB ↗
            </a>
            <a
              href="https://instagram.com/bearnarddd_"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-links text-[12px] tracking-[0.16em] text-white/50 hover:text-white transition-colors"
            >
              INSTAGRAM ↗
            </a>
          </div>
          <p className="contact-links text-[12px] tracking-[0.14em] text-white/25 break-all">
            PREFER EMAIL? → ardoananta1@gmail.com
          </p>
        </div>
      </div>
    </section>
  );
}
