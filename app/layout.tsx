import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import AnimatedBackground from "@/components/AnimatedBackground";
import ScrollProgress from "@/components/ScrollProgress";
import ScrollRevealFx from "@/components/ScrollRevealFx";
import ScrollSectionFade from "@/components/ScrollSectionFade";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bernardo Pramudya Ananta — Creative Developer",
  description:
    "Fresh Graduate in Informatics Engineering focused on building modern web applications, digital systems, and creative solutions. Based in Indonesia.",
  keywords: [
    "Bernardo Pramudya Ananta",
    "developer",
    "portfolio",
    "full-stack",
    "Next.js",
    "web development",
    "informatics engineering",
  ],
  authors: [{ name: "Bernardo Pramudya Ananta" }],
  openGraph: {
    title: "Bernardo Pramudya Ananta — Creative Developer",
    description: "I build digital experiences.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable}`}>
      <body className="font-sans bg-bg text-white antialiased">
        <ScrollProgress />
        <AnimatedBackground />
        <ScrollRevealFx />
        <SmoothScroll />
        <ScrollSectionFade />
        {children}
      </body>
    </html>
  );
}
