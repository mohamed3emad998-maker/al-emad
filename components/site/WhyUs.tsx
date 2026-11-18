import Image from "next/image";
import { Award, Gauge, Headphones, ShieldCheck, Target, Wrench } from "lucide-react";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

const ICONS = [Target, Wrench, ShieldCheck, Gauge, Headphones, Award];

export function WhyUs({ locale, t }: { locale: Locale; t: (k: string) => string }) {
  const image = t("why.image");
  return (
    <section id="why" className="scroll-mt-20 bg-charcoal py-24 text-white sm:py-32">
      <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow text-silver" dir="ltr">
              {t("why.eyebrow")}
            </p>
            <h2 className={cn("mt-5 text-balance font-bold leading-[1.15]", locale === "en" ? "font-wide text-[30px] sm:text-[42px]" : "text-[32px] sm:text-[44px]")}>
              {t("why.title")}
            </h2>
            <p className="mt-5 text-[17px] leading-8 text-silver/90">{t("why.description")}</p>
          </Reveal>
          {image ? (
            <Reveal delay={0.1} className="relative mt-10 aspect-[16/10] overflow-hidden rounded-[4px] bg-navy">
              <Image src={image} alt={t("why.image_alt")} fill sizes="(min-width:1024px) 560px, 92vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
            </Reveal>
          ) : null}
        </div>

        <ul className="grid border-s border-t border-white/10 sm:grid-cols-2">
          {ICONS.map((Icon, i) => (
            <Reveal as="li" key={i} delay={0.06 * i} className="group border-b border-e border-white/10 p-7 transition-colors duration-500 hover:bg-white/[0.03] sm:p-8">
              <span className="grid h-14 w-14 place-items-center rounded-[3px] border border-white/15 text-white transition-colors duration-500 group-hover:border-racing group-hover:text-racing">
                <Icon size={22} strokeWidth={1.6} />
              </span>
              <h3 className="mt-6 text-lg font-bold leading-snug">{t(`why.${i + 1}_title`)}</h3>
              <p className="mt-3 text-[15px] leading-7 text-silver/85">{t(`why.${i + 1}_text`)}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
