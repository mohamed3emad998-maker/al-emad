"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Play, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dict } from "@/lib/i18n";
import type { GalleryCategory, GalleryItem, Locale } from "@/lib/types";
import { cn, loc } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

const ORDER: GalleryCategory[] = ["workshop", "technicians", "cars", "engines", "parts", "diagnostics"];

export function Gallery({
  locale,
  dict,
  items,
  eyebrow,
  title,
}: {
  locale: Locale;
  dict: Dict;
  items: GalleryItem[];
  eyebrow: string;
  title: string;
}) {
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [index, setIndex] = useState<number | null>(null);
  const cats = useMemo(() => ORDER.filter((c) => items.some((i) => i.category === c)), [items]);
  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + visible.length) % visible.length)),
    [visible.length]
  );

  useEffect(() => {
    if (index === null) return;
    const rtl = locale === "ar";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, step, locale]);

  const current = index !== null ? visible[index] : null;
  const PrevIcon = locale === "ar" ? ChevronRight : ChevronLeft;
  const NextIcon = locale === "ar" ? ChevronLeft : ChevronRight;

  return (
    <section id="gallery" className="scroll-mt-20 bg-white py-24 sm:py-32">
      <div className="container">
        <SectionHeading locale={locale} eyebrow={eyebrow} title={title} align="center" />

        <div className="scrollbar-none -mx-4 mt-10 overflow-x-auto px-4">
          <div className="mx-auto flex w-max gap-3">
            {(["all", ...cats] as const).map((c) => (
              <button key={c} type="button" onClick={() => setFilter(c)} aria-pressed={filter === c} className={cn("chip", filter === c && "chip-active")}>
                {c === "all" ? dict.all : dict.gallery[c]}
              </button>
            ))}
          </div>
        </div>

        <motion.ul layout className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          <AnimatePresence mode="popLayout">
            {visible.map((item, i) => {
              const caption = loc(item, "caption", locale);
              const thumb = item.media_type === "video" ? item.poster_url : item.url;
              return (
                <motion.li
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                >
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[4px] bg-navy text-start"
                    aria-label={`${dict.gallery[item.category]} — ${caption}`}
                  >
                    {thumb ? (
                      <Image src={thumb} alt={caption} fill sizes="(min-width:1024px) 400px, (min-width:640px) 45vw, 92vw" className="object-cover transition duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="hatch absolute inset-0" />
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/0 to-navy/0 opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="absolute start-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-navy shadow transition-transform duration-300 group-hover:scale-110">
                      {item.media_type === "video" ? <Play size={16} className="ms-0.5" /> : <Maximize2 size={15} />}
                    </span>
                    <span className="caption-pill absolute bottom-3 end-3">
                      {dict.gallery[item.category]} · {caption}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>

      <AnimatePresence>
        {current ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={loc(current, "caption", locale)}
            className="fixed inset-0 z-[90] flex flex-col bg-charcoal/95 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between p-4 text-white sm:p-6">
              <span className="text-sm text-silver" dir="ltr">
                {(index ?? 0) + 1} / {visible.length}
              </span>
              <button type="button" onClick={close} aria-label={dict.close} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>
            <div className="relative flex flex-1 items-center justify-center px-4 pb-4 sm:px-20" onClick={(e) => e.target === e.currentTarget && close()}>
              <AnimatePresence mode="wait">
                <motion.figure
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="flex max-h-full w-full max-w-6xl flex-col items-center"
                >
                  {current.media_type === "video" ? (
                    <video src={current.url} poster={current.poster_url ?? undefined} controls autoPlay playsInline className="max-h-[75vh] w-full rounded-[4px] bg-black" />
                  ) : (
                    <div className="relative h-[72vh] w-full">
                      <Image src={current.url} alt={loc(current, "caption", locale)} fill sizes="100vw" className="object-contain" />
                    </div>
                  )}
                  <figcaption className="mt-4 text-center text-sm text-silver">
                    <span className="text-white">{dict.gallery[current.category]}</span> · {loc(current, "caption", locale)}
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
              {visible.length > 1 ? (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label={dict.prev} className="absolute start-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-racing sm:start-6">
                    <PrevIcon size={22} />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label={dict.next} className="absolute end-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-racing sm:end-6">
                    <NextIcon size={22} />
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
