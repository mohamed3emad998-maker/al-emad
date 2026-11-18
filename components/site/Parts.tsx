"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Dict } from "@/lib/i18n";
import { JAPANESE_BRANDS, type Locale, type Part, type PartCategory } from "@/lib/types";
import { cn, loc } from "@/lib/utils";
import { Modal } from "./Modal";
import { Reveal } from "./Reveal";
import { RequestForm } from "./RequestForm";

export function Parts({
  locale,
  dict,
  parts,
  categories,
  eyebrow,
  title,
  description,
  customLabel,
  note,
}: {
  locale: Locale;
  dict: Dict;
  parts: Part[];
  categories: PartCategory[];
  eyebrow: string;
  title: string;
  description: string;
  customLabel: string;
  note: string;
}) {
  const [brand, setBrand] = useState<string>("all");
  const [quote, setQuote] = useState<{ name: string } | null>(null);
  const catName = useMemo(() => new Map(categories.map((c) => [c.id, loc(c, "name", locale)])), [categories, locale]);
  const filtered = brand === "all" ? parts : parts.filter((p) => p.brands.includes(brand));

  return (
    <section id="parts" className="scroll-mt-20 bg-paper py-24 sm:py-32">
      <div className="container">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <p className="eyebrow text-slate-500" dir="ltr">
              {eyebrow}
            </p>
            <h2 className={cn("mt-5 text-balance font-bold leading-[1.15] text-navy", locale === "en" ? "font-wide text-[30px] sm:text-[42px]" : "text-[32px] sm:text-[44px]")}>
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-8 text-slate-600">{description}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <button type="button" onClick={() => setQuote({ name: dict.form.generalPart })} className="btn-navy shrink-0 px-7 py-4">
              {customLabel}
            </button>
          </Reveal>
        </div>

        <div className="scrollbar-none -mx-4 mt-10 overflow-x-auto px-4" role="toolbar" aria-label={dict.allBrands}>
          <div className="flex w-max gap-3">
            {["all", ...JAPANESE_BRANDS].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBrand(b)}
                aria-pressed={brand === b}
                className={cn("chip", brand === b && "chip-active")}
              >
                {b === "all" ? dict.allBrands : b}
              </button>
            ))}
          </div>
        </div>

        <motion.ul layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => {
              const name = loc(p, "name", locale);
              const cat = p.category_id ? catName.get(p.category_id) : undefined;
              return (
                <motion.li
                  layout
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35 }}
                >
                  <article className="group flex h-full flex-col overflow-hidden rounded-[4px] border border-line bg-white transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-35px_rgba(16,28,44,.45)]">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#dde0e5]">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={loc(p, "image_alt", locale) || name}
                          fill
                          sizes="(min-width:1024px) 400px, (min-width:640px) 45vw, 92vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="hatch-light absolute inset-0" />
                      )}
                      {cat ? <span className="absolute start-4 top-4 rounded-full bg-navy px-3.5 py-1.5 text-xs font-semibold text-white">{cat}</span> : null}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-xl font-bold text-navy">{name}</h3>
                      <p className="mt-3 text-[15px] leading-7 text-slate-600">{loc(p, "description", locale)}</p>
                      <div className="mt-auto pt-6">
                        {p.brands.length ? (
                          <>
                            <p className="text-xs font-semibold text-slate-500">{dict.compatibleWith}</p>
                            <ul className="mt-2 flex flex-wrap gap-1.5" dir="ltr" style={{ justifyContent: locale === "ar" ? "flex-end" : "flex-start" }}>
                              {p.brands.map((b) => (
                                <li key={b} className="rounded-[2px] bg-paper px-2.5 py-1 font-wide text-[10px] font-bold uppercase tracking-[0.14em] text-navy">
                                  {b}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                        <button type="button" onClick={() => setQuote({ name })} className="btn-red mt-5 w-full shadow-none hover:translate-y-0">
                          {dict.requestQuote}
                        </button>
                      </div>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
        {!filtered.length ? <p className="mt-10 rounded-[4px] border border-dashed border-line bg-white p-8 text-center text-slate-600">{dict.noParts}</p> : null}
        {note ? <p className="mt-8 text-xs leading-6 text-slate-500">{note}</p> : null}
      </div>

      <Modal open={!!quote} onClose={() => setQuote(null)} labelledBy="quote-title" closeLabel={dict.close}>
        {quote ? (
          <div className="p-7 sm:p-9">
            <p className="eyebrow text-slate-500" dir="ltr">
              QUOTE
            </p>
            <h3 id="quote-title" className="mt-4 pe-10 text-2xl font-bold text-navy">
              {dict.form.quoteTitle}
            </h3>
            <p className="mt-2 text-slate-600">
              {dict.form.quoteFor}: <strong className="text-navy">{quote.name}</strong>
            </p>
            <div className="mt-7">
              <RequestForm locale={locale} dict={dict} kind="quote" partName={quote.name} defaultBrand={brand !== "all" ? brand : undefined} compact />
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
