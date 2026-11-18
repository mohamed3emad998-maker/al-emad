import { Phone } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import type { Locale, SiteSettings } from "@/lib/types";
import { telHref, whatsappHref } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";
import { RequestForm } from "./RequestForm";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Booking({
  locale,
  dict,
  settings,
  services,
  eyebrow,
  title,
  description,
}: {
  locale: Locale;
  dict: Dict;
  settings: SiteSettings;
  services: string[];
  eyebrow: string;
  title: string;
  description: string;
}) {
  const c = settings.contact;
  const wa = whatsappHref(c.whatsapp || c.phone, locale === "ar" ? "مرحبًا، أرغب في حجز موعد صيانة." : "Hello, I'd like to book a service appointment.");
  const tel = telHref(c.phone);
  const address = (locale === "ar" ? c.address_ar : c.address_en) || c.address_ar || c.address_en;
  const mapSrc = c.maps_embed_query ? `https://www.google.com/maps?q=${encodeURIComponent(c.maps_embed_query)}&output=embed` : "";

  return (
    <section id="booking" className="scroll-mt-20 bg-paper py-24 sm:py-32">
      <div className="container">
        <SectionHeading locale={locale} eyebrow={eyebrow} title={title} description={description} />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.75fr_1fr]">
          <Reveal className="rounded-[4px] border border-line bg-white p-6 sm:p-10">
            <RequestForm locale={locale} dict={dict} kind="booking" services={services} listen />
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col rounded-[4px] bg-navy p-6 text-white sm:p-10">
            <a
              href={wa || "#booking"}
              target={wa ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-disabled={!wa}
              className="btn w-full bg-whatsapp text-white hover:brightness-110"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {dict.whatsappUs}
            </a>
            <a href={tel || "#booking"} aria-disabled={!tel} className="btn mt-3 w-full border border-white/25 text-white hover:border-white">
              <Phone size={18} />
              {dict.callNow}
            </a>

            <dl className="mt-10 space-y-6 text-[15px]">
              <div>
                <dt className="text-xs text-silver">{dict.phone}</dt>
                <dd className="mt-1 text-lg font-bold" dir="ltr" style={{ textAlign: "start" }}>
                  {c.phone ? <a href={tel}>{c.phone}</a> : dict.phonePlaceholder}
                </dd>
              </div>
              {c.email ? (
                <div>
                  <dt className="text-xs text-silver">{dict.email}</dt>
                  <dd className="mt-1 font-semibold">
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs text-silver">{dict.address}</dt>
                <dd className="mt-1 font-semibold">
                  {c.maps_url && address ? (
                    <a href={c.maps_url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                      {address}
                    </a>
                  ) : (
                    address || dict.addressPlaceholder
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-silver">{dict.hours}</dt>
                <dd className="mt-2 space-y-2">
                  {c.hours.map((h, i) => (
                    <div key={i} className="flex justify-between gap-4">
                      <span>{locale === "ar" ? h.days_ar : h.days_en}</span>
                      <span className="font-semibold" dir="ltr">
                        {(locale === "ar" ? h.time_ar : h.time_en) || dict.hoursPlaceholder}
                      </span>
                    </div>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="relative mt-8 min-h-[220px] flex-1 overflow-hidden rounded-[3px] bg-[#16243a]">
              {mapSrc ? (
                <iframe
                  title="Google Maps"
                  src={mapSrc}
                  className="absolute inset-0 h-full w-full border-0 grayscale-[30%]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <>
                  <div className="hatch absolute inset-0" />
                  <span className="caption-pill absolute bottom-4 start-4">{dict.mapPlaceholder}</span>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
