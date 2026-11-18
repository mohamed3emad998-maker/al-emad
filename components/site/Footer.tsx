import type { Dict } from "@/lib/i18n";
import type { Locale, Service, SiteSettings } from "@/lib/types";
import { loc, telHref, whatsappHref } from "@/lib/utils";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, XIcon, YouTubeIcon } from "./icons";
import { Logo } from "./Logo";

export function Footer({
  locale,
  dict,
  settings,
  services,
  description,
  copyright,
  tagline,
}: {
  locale: Locale;
  dict: Dict;
  settings: SiteSettings;
  services: Service[];
  description: string;
  copyright: string;
  tagline: string;
}) {
  const c = settings.contact;
  const wa = whatsappHref(c.whatsapp || c.phone);
  const address = (locale === "ar" ? c.address_ar : c.address_en) || c.address_ar || c.address_en;
  const socials = [
    { href: settings.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: settings.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: settings.social.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: settings.social.x, label: "X", Icon: XIcon },
    { href: settings.social.youtube, label: "YouTube", Icon: YouTubeIcon },
  ].filter((s) => s.href);
  const quick = settings.nav.filter((n) => n.visible);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-white">
      <div className="container grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-20">
        <div>
          <Logo logoUrl={settings.logo_url} tagline={tagline} />
          <p className="mt-6 max-w-sm text-[15px] leading-7 text-silver/85">{description}</p>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn mt-6 bg-whatsapp px-6 py-3 text-white hover:brightness-110">
              <WhatsAppIcon className="h-5 w-5" />
              {dict.footer.whatsapp}
            </a>
          ) : null}
        </div>

        <nav aria-label={dict.footer.quickLinks}>
          <h2 className="text-sm font-bold">{dict.footer.quickLinks}</h2>
          <ul className="mt-6 space-y-3.5 text-[15px] text-silver/85">
            {quick.map((n) => (
              <li key={n.id}>
                <a href={n.href} className="transition-colors hover:text-white">
                  {locale === "ar" ? n.label_ar : n.label_en}
                </a>
              </li>
            ))}
            <li>
              <a href="#gallery" className="transition-colors hover:text-white">
                {dict.footer.gallery}
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label={dict.footer.services}>
          <h2 className="text-sm font-bold">{dict.footer.services}</h2>
          <ul className="mt-6 space-y-3.5 text-[15px] text-silver/85">
            {services.slice(0, 6).map((s) => (
              <li key={s.id}>
                <a href="#services" className="transition-colors hover:text-white">
                  {loc(s, "title", locale)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold">{dict.footer.contact}</h2>
          <ul className="mt-6 space-y-3.5 text-[15px] text-silver/85">
            <li dir="ltr" style={{ textAlign: "start" }}>
              {c.phone ? <a href={telHref(c.phone)} className="hover:text-white">{c.phone}</a> : dict.phonePlaceholder}
            </li>
            <li>{c.email ? <a href={`mailto:${c.email}`} className="hover:text-white">{c.email}</a> : `[${dict.email}]`}</li>
            <li>{address || dict.addressPlaceholder}</li>
          </ul>
          {socials.length ? (
            <ul className="mt-6 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white/85 transition hover:border-racing hover:bg-racing hover:text-white"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-6 text-sm text-silver/80 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {copyright}
          </p>
          <p className="font-wide text-xs uppercase tracking-[0.2em]" dir="ltr">
            AL-EMAD Automotive Services
          </p>
        </div>
      </div>
    </footer>
  );
}
