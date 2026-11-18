"use client";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Dict } from "@/lib/i18n";
import type { Locale, Testimonial } from "@/lib/types";
import { cn, loc } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function Testimonials({
  locale,
  dict,
  items,
  eyebrow,
  title,
  description,
}: {
  locale: Locale;
  dict: Dict;
  items: Testimonial[];
  eyebrow: string;
  title: string;
  description: string;
}) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = items.length;

  const go = useCallback(
    (d: 1 | -1) => {
      if (!n) return;
      setDir(d);
      setI((x) => (x + d + n) % n);
    },
    [n]
  );

  useEffect(() => {
    if (paused || reduce || n < 2) return;
    const id = setInterval(() => go(1), 7000);
    return () => clearInterval(id);
  }, [paused, reduce, n, go]);

  const cur = items[i];
  const rtl = locale === "ar";
  const offset = (d: number) => (rtl ? -d : d) * 40;

  return (
    <section id="testimonials" className="scroll-mt-20 bg-navy py-24 text-white sm:py-32">
      <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <p className="eyebrow text-silver" dir="ltr">
            {eyebrow}
          </p>
          <h2 className={cn("mt-5 font-bold leading-[1.15]", locale === "en" ? "font-wide text-[30px] sm:text-[42px]" : "text-[32px] sm:text-[44px]")}>{title}</h2>
          <p className="mt-5 max-w-lg text-[17px] leading-8 text-silver/90">{description}</p>
          {n > 1 ? (
            <div className="mt-10 flex items-center gap-4">
              <button type="button" onClick={() => go(-1)} aria-label={dict.prev} className="grid h-14 w-14 place-items-center rounded-full border border-white/25 transition hover:border-white">
                {rtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
              <button type="button" onClick={() => go(1)} aria-label={dict.next} className="grid h-14 w-14 place-items-center rounded-full bg-racing transition hover:bg-[#bf1f1f]">
                {rtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
              <div className="ms-2 flex items-center gap-2" role="tablist">
                {items.map((t, k) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={k === i}
                    aria-label={`${k + 1}`}
                    onClick={() => {
                      setDir(k > i ? 1 : -1);
                      setI(k);
                    }}
                    className={cn("h-2 rounded-full transition-all duration-300", k === i ? "w-8 bg-racing" : "w-2 bg-white/30 hover:bg-white/60")}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </Reveal>

        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} className="relative min-h-[360px]" aria-live="polite">
          {cur ? (
            <AnimatePresence mode="wait" custom={dir}>
              <motion.figure
                key={cur.id}
                initial={reduce ? false : { opacity: 0, x: offset(dir) }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: offset(-dir) }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[4px] border border-white/[0.06] bg-charcoal p-8 sm:p-12"
              >
                <span aria-hidden className="block font-serif text-7xl leading-[0.6] text-racing">
                  {rtl ? "”" : "“"}
                </span>
                <div className="mt-6 flex gap-1" aria-label={`${cur.rating}/5`}>
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} size={18} className={k < cur.rating ? "fill-[#F2B53A] text-[#F2B53A]" : "text-white/20"} />
                  ))}
                </div>
                <blockquote className="mt-6 text-xl font-medium leading-9 sm:text-[22px] sm:leading-10">{loc(cur, "text", locale)}</blockquote>
                <figcaption className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#1d2a3d]">
                    {cur.photo_url ? <Image src={cur.photo_url} alt={cur.customer_name} fill sizes="56px" className="object-cover" /> : <span className="hatch absolute inset-0" />}
                  </span>
                  <span>
                    <span className="block font-bold">{cur.customer_name}</span>
                    {cur.car ? <span className="mt-0.5 block text-sm text-silver">{cur.car}</span> : null}
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          ) : (
            <p className="text-silver">{dict.testimonialsEmpty}</p>
          )}
        </div>
      </div>
    </section>
  );
}
