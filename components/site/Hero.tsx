"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { JAPANESE_BRANDS, type Locale } from "@/lib/types";

type Props = {
  locale: Locale;
  videoUrl: string;
  posterUrl: string;
  overlay: number;
  eyebrow: string;
  title1: string;
  title2: string;
  accent: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  brandsLabel: string;
  scrollLabel: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero(p: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  // Respect reduced motion & data-saver: keep the poster image instead of the video.
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduce || conn?.saveData || !p.videoUrl) return;
    setShowVideo(true);
  }, [reduce, p.videoUrl]);

  const Arrow = p.locale === "ar" ? ArrowLeft : ArrowRight;
  const overlay = Math.min(Math.max(p.overlay ?? 70, 0), 95) / 100;
  const item = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 34 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay: 0.15 + i * 0.12, ease },
  });

  return (
    <section ref={ref} id="home" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-navy text-white">
      {/* Background media */}
      <motion.div style={{ y: reduce ? 0 : y }} className="absolute inset-0 -z-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.posterUrl} alt="" aria-hidden className="h-full w-full object-cover" fetchPriority="high" />
        {showVideo ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={p.videoUrl}
            poster={p.posterUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
        ) : null}
      </motion.div>
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(${p.locale === "ar" ? "270deg" : "90deg"}, rgb(var(--c-navy) / ${overlay + 0.2}) 0%, rgb(var(--c-navy) / ${overlay}) 45%, rgb(var(--c-navy) / ${Math.max(overlay - 0.3, 0.15)}) 100%), linear-gradient(0deg, rgb(var(--c-navy)) 0%, transparent 35%)`,
        }}
      />
      <div className="hatch absolute inset-0 -z-10 opacity-60" />
      {/* Outline wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-24 -z-10 select-none overflow-hidden whitespace-nowrap text-center font-wide text-[22vw] font-black leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.05)]"
        dir="ltr"
      >
        AL-EMAD
      </div>

      <div className="container flex flex-1 flex-col justify-center pb-16 pt-32 sm:pt-36">
        <div className="max-w-[760px]">
          <motion.p {...item(0)} className="eyebrow text-silver" dir="ltr">
            {p.eyebrow}
          </motion.p>
          <motion.h1
            {...item(1)}
            className="mt-6 font-wide text-[44px] font-black uppercase leading-[0.95] tracking-[-0.01em] sm:text-7xl lg:text-[88px]"
          >
            <span className="block">{p.title1}</span>
            <span className="block">{p.title2}</span>
            <span className="block text-racing">{p.accent}</span>
          </motion.h1>
          <motion.p {...item(2)} lang="ar" dir="rtl" className="mt-7 font-arabic text-2xl font-bold leading-snug sm:text-[34px]" style={{ textAlign: "start" }}>
            {p.subtitle}
          </motion.p>
          <motion.p {...item(3)} className="mt-5 max-w-xl text-[17px] leading-8 text-white/80 sm:text-lg">
            {p.description}
          </motion.p>
          <motion.div {...item(4)} className="mt-10 flex flex-wrap gap-4">
            <a href="#booking" className="btn-red group px-7 py-4">
              {p.ctaPrimary}
              <Arrow size={18} className="transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </a>
            <a href="#services" className="btn-ghost px-7 py-4">
              {p.ctaSecondary}
            </a>
          </motion.div>
        </div>
      </div>

      {/* Brands strip */}
      <div className="border-t border-white/10 bg-navy/60 backdrop-blur-sm">
        <div className="container flex items-center gap-8 py-6">
          <span className="hidden shrink-0 text-sm text-silver md:block">{p.brandsLabel}</span>
          <ul className="scrollbar-none flex flex-1 items-center justify-between gap-8 overflow-x-auto" dir="ltr">
            {JAPANESE_BRANDS.map((b) => (
              <li key={b} className="shrink-0 font-wide text-[13px] font-bold uppercase tracking-[0.22em] text-silver/80 transition-colors hover:text-white sm:text-sm">
                {b}
              </li>
            ))}
          </ul>
          <a href="#about" aria-label={p.scrollLabel} className="hidden shrink-0 md:block">
            <span className="flex h-11 w-7 justify-center rounded-full border-2 border-white/40 pt-2">
              <span className="h-2 w-1 animate-scrollDot rounded-full bg-white" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
