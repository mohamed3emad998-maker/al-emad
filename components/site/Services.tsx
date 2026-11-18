"use client";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { requestBooking } from "@/lib/booking-bus";
import type { Dict } from "@/lib/i18n";
import type { Locale, Service } from "@/lib/types";
import { cn, loc } from "@/lib/utils";
import { Modal } from "./Modal";
import { Reveal } from "./Reveal";

export function Services({
  locale,
  services,
  dict,
  eyebrow,
  title,
  description,
}: {
  locale: Locale;
  services: Service[];
  dict: Dict;
  eyebrow: string;
  title: string;
  description: string;
}) {
  const [active, setActive] = useState<Service | null>(null);
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section id="services" className="relative scroll-mt-20 bg-navy py-24 text-white sm:py-32">
      <div className="container">
        <div className="grid items-end gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-silver" dir="ltr">
              {eyebrow}
            </p>
            <h2 className={cn("mt-5 text-balance font-bold leading-[1.12]", locale === "en" ? "font-wide text-[32px] sm:text-5xl" : "text-[32px] sm:text-[46px]")}>
              {title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-[17px] leading-8 text-silver/90 lg:ms-auto">{description}</p>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => {
            const t = loc(s, "title", locale);
            return (
              <Reveal as="li" key={s.id} delay={(i % 4) * 0.07}>
                <article className="group flex h-full flex-col overflow-hidden rounded-[4px] border border-white/[0.06] bg-charcoal transition duration-500 hover:-translate-y-1.5 hover:border-white/15 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#1b2433]">
                    {s.image_url ? (
                      <Image
                        src={s.image_url}
                        alt={loc(s, "image_alt", locale) || t}
                        fill
                        sizes="(min-width:1024px) 300px, (min-width:640px) 45vw, 92vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.07]"
                      />
                    ) : (
                      <div className="hatch absolute inset-0" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-wide text-sm font-bold tracking-[0.15em] text-silver">{String(i + 1).padStart(2, "0")}</span>
                      <span className="h-[2px] w-8 bg-racing transition-all duration-500 group-hover:w-14" />
                    </div>
                    <h3 className="mt-3 text-xl font-bold leading-snug">{t}</h3>
                    <p className="mt-3 flex-1 text-[15px] leading-7 text-silver/85">{loc(s, "summary", locale)}</p>
                    <button
                      type="button"
                      onClick={() => setActive(s)}
                      className="mt-6 inline-flex w-fit items-center gap-2 text-[15px] font-semibold text-white transition-colors hover:text-racing"
                      aria-label={`${dict.learnMore}: ${t}`}
                    >
                      {dict.learnMore}
                      <Arrow size={16} className="transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                    </button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} labelledBy="service-modal-title" closeLabel={dict.close}>
        {active ? (
          <div>
            <div className="relative aspect-[16/8] bg-navy">
              {active.image_url ? (
                <Image src={active.image_url} alt={loc(active, "image_alt", locale)} fill sizes="672px" className="object-cover" />
              ) : null}
            </div>
            <div className="p-7 sm:p-9">
              <span className="block h-[2px] w-10 bg-racing" />
              <h3 id="service-modal-title" className="mt-3 text-2xl font-bold text-navy sm:text-3xl">
                {loc(active, "title", locale)}
              </h3>
              <p className="mt-4 text-[16px] leading-8 text-slate-600">{loc(active, "summary", locale)}</p>
              {loc(active, "details", locale) ? (
                <p className="mt-3 text-[16px] leading-8 text-slate-600">{loc(active, "details", locale)}</p>
              ) : null}
              <button
                type="button"
                className="btn-red mt-8"
                onClick={() => {
                  const name = loc(active, "title", locale);
                  setActive(null);
                  setTimeout(() => requestBooking(name), 250);
                }}
              >
                {dict.bookThisService}
                <Arrow size={18} />
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
