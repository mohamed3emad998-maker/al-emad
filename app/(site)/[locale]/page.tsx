import { About } from "@/components/site/About";
import { Booking } from "@/components/site/Booking";
import { Footer } from "@/components/site/Footer";
import { Gallery } from "@/components/site/Gallery";
import { Hero } from "@/components/site/Hero";
import { Navbar } from "@/components/site/Navbar";
import { Parts } from "@/components/site/Parts";
import { Services } from "@/components/site/Services";
import { Testimonials } from "@/components/site/Testimonials";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { WhyUs } from "@/components/site/WhyUs";
import { getSiteData } from "@/lib/data";
import { SITE_URL } from "@/lib/env";
import { getDict, makeT } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { loc, whatsappHref } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const data = await getSiteData();
  const { settings, content } = data;
  const t = makeT(content, locale);
  const dict = getDict(locale);
  const on = settings.sections;
  const serviceNames = data.services.map((s) => loc(s, "title", locale));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: locale === "ar" ? "العماد لخدمات السيارات" : "AL-EMAD Automotive Services",
    url: `${SITE_URL}/${locale}`,
    image: settings.hero.poster_url,
    description: settings.seo[locale]?.description,
    ...(settings.contact.phone ? { telephone: settings.contact.phone } : {}),
    ...(settings.contact.email ? { email: settings.contact.email } : {}),
    ...(settings.contact.address_ar || settings.contact.address_en
      ? { address: (locale === "ar" ? settings.contact.address_ar : settings.contact.address_en) || settings.contact.address_ar }
      : {}),
    sameAs: Object.values(settings.social).filter(Boolean),
    makesOffer: serviceNames.map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-navy">
        {dict.skip}
      </a>
      <Navbar locale={locale} nav={settings.nav} cta={t("nav.cta")} tagline={t("brand.tagline")} logoUrl={settings.logo_url} menuLabel={dict.menu} />
      <main id="main">
        {on.hero ? (
          <Hero
            locale={locale}
            videoUrl={settings.hero.video_url}
            posterUrl={settings.hero.poster_url}
            overlay={settings.hero.overlay}
            eyebrow={t("hero.eyebrow")}
            title1={t("hero.title_1")}
            title2={t("hero.title_2")}
            accent={t("hero.title_accent")}
            subtitle={t("hero.subtitle")}
            description={t("hero.description")}
            ctaPrimary={t("hero.cta_primary")}
            ctaSecondary={t("hero.cta_secondary")}
            brandsLabel={t("hero.brands_label")}
            scrollLabel={dict.scroll}
          />
        ) : (
          <div id="home" className="h-[76px] bg-navy" />
        )}
        {on.about ? <About locale={locale} t={t} stats={data.stats} /> : null}
        {on.services && data.services.length ? (
          <Services locale={locale} dict={dict} services={data.services} eyebrow={t("services.eyebrow")} title={t("services.title")} description={t("services.description")} />
        ) : null}
        {on.parts ? (
          <Parts
            locale={locale}
            dict={dict}
            parts={data.parts}
            categories={data.categories}
            eyebrow={t("parts.eyebrow")}
            title={t("parts.title")}
            description={t("parts.description")}
            customLabel={t("parts.custom_request")}
            note={t("parts.note")}
          />
        ) : null}
        {on.why ? <WhyUs locale={locale} t={t} /> : null}
        {on.gallery && data.gallery.length ? <Gallery locale={locale} dict={dict} items={data.gallery} eyebrow={t("gallery.eyebrow")} title={t("gallery.title")} /> : null}
        {on.testimonials ? (
          <Testimonials
            locale={locale}
            dict={dict}
            items={data.testimonials}
            eyebrow={t("testimonials.eyebrow")}
            title={t("testimonials.title")}
            description={t("testimonials.description")}
          />
        ) : null}
        {on.booking ? (
          <Booking
            locale={locale}
            dict={dict}
            settings={settings}
            services={serviceNames}
            eyebrow={t("booking.eyebrow")}
            title={t("booking.title")}
            description={t("booking.description")}
          />
        ) : null}
      </main>
      <Footer
        locale={locale}
        dict={dict}
        settings={settings}
        services={data.services}
        description={t("footer.description")}
        copyright={t("footer.copyright")}
        tagline={t("brand.tagline")}
      />
      {on.whatsapp_fab ? <WhatsAppFab href={whatsappHref(settings.contact.whatsapp || settings.contact.phone)} label={dict.whatsappUs} /> : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
