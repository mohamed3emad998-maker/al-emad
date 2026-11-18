import Image from "next/image";
import type { Locale, Stat } from "@/lib/types";
import { cn, loc } from "@/lib/utils";
import { Counter } from "./Counter";
import { Reveal } from "./Reveal";

type T = (key: string, strict?: boolean) => string;

export function About({ locale, t, stats }: { locale: Locale; t: T; stats: Stat[] }) {
  const subtitle = t("about.subtitle", true);
  return (
    <section id="about" className="relative scroll-mt-20 bg-white py-24 sm:py-32">
      <div className="container">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow text-slate-500" dir="ltr">
                {t("about.eyebrow")}
              </p>
              <h2
                className={cn(
                  "mt-5 text-balance font-bold leading-[1.15] text-navy",
                  locale === "en" ? "font-wide text-[32px] sm:text-[44px]" : "text-[32px] sm:text-[44px]"
                )}
              >
                {t("about.title")}
              </h2>
              {subtitle ? (
                <p className="mt-4 font-wide text-lg font-semibold text-slate-600" dir="ltr" style={{ textAlign: "start" }}>
                  {subtitle}
                </p>
              ) : null}
              <p className="mt-6 text-[17px] leading-9 text-slate-600">{t("about.body")}</p>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                ["about.mission_title", "about.mission"],
                ["about.vision_title", "about.vision"],
              ].map(([title, body], i) => (
                <Reveal key={title} delay={0.1 * i}>
                  <div className="h-full rounded-[4px] border border-line p-6 transition-shadow duration-300 hover:shadow-[0_20px_50px_-30px_rgba(16,28,44,.35)]">
                    <h3 className={cn("text-sm font-bold text-racing", locale === "en" && "font-wide uppercase tracking-[0.2em]")}>{t(title)}</h3>
                    <p className="mt-3 text-[15px] leading-7 text-slate-600">{t(body)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Image composition */}
          <Reveal className="relative mx-auto w-full max-w-[560px] pb-24 pe-0 sm:pe-24 lg:pb-28">
            <div className="relative aspect-square overflow-hidden rounded-[4px] bg-navy">
              <Image
                src={t("about.image_main")}
                alt={t("about.image_main_alt")}
                fill
                sizes="(min-width: 1024px) 480px, 90vw"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 end-0 w-[58%] overflow-hidden rounded-[4px] border-[6px] border-white bg-navy shadow-2xl sm:w-[55%]">
              <div className="relative aspect-[1/0.95]">
                <Image
                  src={t("about.image_secondary")}
                  alt={t("about.image_secondary_alt")}
                  fill
                  sizes="(min-width: 1024px) 300px, 55vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute start-3 top-4 flex sm:top-auto sm:bottom-8 items-center gap-4 rounded-[4px] bg-navy px-6 py-5 text-white shadow-[0_30px_60px_-20px_rgba(16,28,44,.55)] sm:bottom-8 sm:start-6">
              <span className="font-wide text-5xl font-black text-racing">{t("about.badge_number")}</span>
              <span className="max-w-[150px] text-sm leading-6">{t("about.badge_text")}</span>
            </div>
          </Reveal>
        </div>

        {stats.length ? (
          <dl className="mt-20 grid grid-cols-2 border-y border-line lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal
                key={s.id}
                delay={0.08 * i}
                className={cn("px-6 py-8 sm:px-8", i % 2 === 1 && "border-s border-line", i >= 2 && "border-t border-line lg:border-t-0", i === 2 && "lg:border-s")}
              >
                <dt className="sr-only">{loc(s, "label", locale)}</dt>
                <dd className="font-wide text-4xl font-black text-navy sm:text-5xl" dir="ltr" style={{ textAlign: "start" }}>
                  <Counter value={s.value} digits={String(s.value ?? "").length || (i === 1 ? 3 : 2)} />
                  <span className="text-racing">{s.suffix}</span>
                </dd>
                <dd className="mt-2 text-[15px] text-slate-600">{loc(s, "label", locale)}</dd>
              </Reveal>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
