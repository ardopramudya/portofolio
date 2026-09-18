"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function About() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let ctx: gsap.Context | null = null;
    import("gsap/ScrollTrigger").then((mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".about-photo", {
          y: 28,
          scale: 0.97,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
        });
        gsap.fromTo(
          ".about-photo-inner",
          { yPercent: -4 },
          {
            yPercent: 5,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.9 },
          }
        );
        gsap.from(".about-headline", {
          y: 36,
          opacity: 0,
          duration: 1,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ".about-headline", start: "top 88%", once: true },
        });
        gsap.from(".about-copy", {
          y: 22,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: ".about-copy-wrap", start: "top 88%", once: true },
        });
        gsap.from(".about-chip", {
          y: 14,
          opacity: 0,
          scale: 0.96,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: ".about-chips", start: "top 92%", once: true },
        });
        gsap.from(".about-stat", {
          y: 22,
          opacity: 0,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".about-stats", start: "top 90%", once: true },
        });
        gsap.from(".about-divider", {
          scaleX: 0,
          transformOrigin: "0 0",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: ".about-divider", start: "top 95%", once: true },
        });
      }, ref);
    });
    return () => ctx?.revert();
  }, []);

  return (
    <section ref={ref} id="about" className="bg-transparent border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-8 py-16 md:py-24">
        <p className="about-headline text-[11px] tracking-[0.2em] text-white/40 font-medium">
          ABOUT ME — 01
        </p>

        <div className="mt-6 grid lg:grid-cols-[420px_1fr] gap-10 lg:gap-16 xl:gap-20 items-start">
          {/* Photo */}
          <div className="about-photo will-change-transform">
            <div className="about-photo-inner relative overflow-hidden rounded-[24px] bg-[#141414] border border-white/[0.06] aspect-[4/5] lg:aspect-[4/5] will-change-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] via-[#161616] to-[#0f0f0f]" />
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, transparent 0 28px, rgba(255,255,255,0.6) 28px 29px)`,
                }}
              />
              <img
                src="/foto.png"
                alt="Bernardo Pramudya Ananta"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-left">
                <p className="text-[11px] tracking-[0.2em] text-white/80 font-medium">
                  BERNARDO PRAMUDYA ANANTA
                </p>
                <p className="mt-1 text-[12px] tracking-wide text-white/60">
                  Front-End Developer & QA
                </p>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-white/[0.04]" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#141414] border border-white/[0.06] px-5 py-4">
                <p className="text-[10px] tracking-[0.16em] text-white/30">LOCATION</p>
                <p className="mt-1 text-[13px] font-medium text-white">Indonesia</p>
              </div>
              <div className="rounded-2xl bg-[#141414] border border-white/[0.06] px-5 py-4">
                <p className="text-[10px] tracking-[0.16em] text-white/30">ROLE</p>
                <p className="mt-1 text-[13px] font-medium text-white leading-tight">
                  Front-End Developer & QA
                </p>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="lg:pt-1">
            <h2 className="about-headline font-display text-[34px] md:text-[52px] font-bold tracking-[-0.05em] leading-[0.9] text-white">
              CRAFTING
              <br />
              DIGITAL
              <br />
              <span className="text-white/55">PRODUCTS</span>
            </h2>

            <p className="about-copy mt-6 text-[17px] md:text-[19px] leading-relaxed text-white/85">
              Informatics graduate with experience in developing web applications using React.js and
              Laravel. Skilled in building responsive user interfaces, developing backend systems,
              optimizing website performance, and conducting software testing to ensure functionality
              and reliability. Familiar with functional testing, bug identification, and User Acceptance
              Testing (UAT). Passionate about creating efficient, user-friendly, and reliable digital
              solutions.
            </p>
            <div className="about-copy-wrap mt-5 space-y-4 text-[14px] md:text-[15px] leading-relaxed text-white/50 max-w-[56ch]">
              <p className="about-copy">
                I focus on building clean, performant, and maintainable products — from responsive
                interfaces to scalable backend systems. My work blends engineering discipline with a taste
                for editorial, premium design.
              </p>
              <p className="about-copy">
                Currently exploring modern web stacks and shipping real projects that solve real problems —
                with attention to detail from the first pixel to production.
              </p>
            </div>

            <div className="about-chips mt-8 flex flex-wrap gap-2">
              <span className="about-chip rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] tracking-[0.14em] text-white/60">
                BERNARDO PRAMUDYA ANANTA
              </span>
              <span className="about-chip rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] tracking-[0.14em] text-white/60">
                S1 TEKNIK INFORMATIKA
              </span>
              <span className="about-chip rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] tracking-[0.14em] text-white/60">
                INDONESIA
              </span>
            </div>

            <div className="about-divider mt-10 h-px bg-white/[0.07] origin-left" />
            <div className="about-stats mt-8 grid grid-cols-3 gap-6 md:gap-8">
              <div className="about-stat">
                <div className="font-display text-[30px] md:text-[40px] font-bold tracking-[-0.04em] leading-none text-white">
                  03<span className="text-white/40">+</span>
                </div>
                <div className="mt-2 text-[11px] tracking-[0.16em] text-white/40">PROJECTS</div>
              </div>
              <div className="about-stat">
                <div className="font-display text-[30px] md:text-[40px] font-bold tracking-[-0.04em] leading-none text-white">
                  10<span className="text-white/40">+</span>
                </div>
                <div className="mt-2 text-[11px] tracking-[0.16em] text-white/40">TECHNOLOGIES</div>
              </div>
              <div className="about-stat">
                <div className="font-display text-[30px] md:text-[40px] font-bold tracking-[-0.04em] leading-none text-white">
                  ∞
                </div>
                <div className="mt-2 text-[11px] tracking-[0.16em] text-white/40">IDEAS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
