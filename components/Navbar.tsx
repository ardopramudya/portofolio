"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "WORK", href: "#work" },
  { label: "ABOUT", href: "#about" },
  { label: "SKILLS", href: "#skills" },
  { label: "EXPERIENCE", href: "#experience" },
  { label: "EDUCATION", href: "#education" },
  { label: "SERVICES", href: "#services" },
  { label: "CONTACT", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="mx-auto max-w-[1440px] flex items-center justify-between px-6 md:px-8 h-[72px] md:h-[76px]">
          <a
            href="#"
            className="font-display text-[20px] md:text-[22px] font-bold tracking-[-0.04em] text-white"
            aria-label="Bernardo — home"
          >
            BERNARDO<span className="inline-block w-[6px] h-[6px] bg-white rounded-full ml-[3px] -translate-y-[2px]" />
          </a>

          <div className="hidden lg:flex items-center gap-7">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[11px] tracking-[0.18em] font-medium text-white/65 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:block">
            <a
              href="#contact"
              className="inline-flex items-center rounded-full border border-white/15 px-5 py-2 text-[12px] tracking-[0.14em] font-medium text-white hover:bg-white hover:text-black transition-colors"
            >
              LET&apos;S TALK
            </a>
          </div>

          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-[#0a0a0a] lg:hidden flex flex-col transition-all duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="flex-1 flex flex-col justify-center px-8 gap-1 pt-16 overflow-y-auto">
          {links.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display text-[40px] sm:text-[48px] leading-none tracking-[-0.05em] text-white py-2"
              style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="px-8 pb-8 flex flex-col gap-4">
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center rounded-full bg-white text-black h-[52px] text-sm tracking-[0.16em] font-medium"
          >
            LET&apos;S TALK ↗
          </a>
          <p className="text-xs tracking-[0.14em] text-white/40">© 2026 BERNARDO</p>
        </div>
      </div>
    </>
  );
}
