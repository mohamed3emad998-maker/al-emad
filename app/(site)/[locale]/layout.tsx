import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "../../globals.css";
import { getSiteData } from "@/lib/data";
import { SITE_URL } from "@/lib/env";
import { fontVars } from "@/lib/fonts";
import { themeCss } from "@/lib/theme";
import { LOCALES, type Locale } from "@/lib/types";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#101C2C",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const { settings } = await getSiteData();
  const seo = settings.seo[params.locale] ?? settings.seo.ar;
  const og = settings.hero.poster_url;
  return {
    metadataBase: new URL(SITE_URL),
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `/${params.locale}`,
      languages: { ar: "/ar", en: "/en", "x-default": "/ar" },
    },
    openGraph: {
      type: "website",
      siteName: "AL-EMAD",
      title: seo.title,
      description: seo.description,
      locale: params.locale === "ar" ? "ar_OM" : "en_US",
      url: `/${params.locale}`,
      images: og ? [{ url: og, width: 1920, height: 1080 }] : undefined,
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: og ? [og] : undefined },
    icons: settings.favicon_url ? { icon: settings.favicon_url } : { icon: "/icon.svg" },
    robots: { index: true, follow: true },
  };
}

export default async function SiteLayout({ children, params }: { children: ReactNode; params: { locale: Locale } }) {
  if (!LOCALES.includes(params.locale)) notFound();
  const { settings } = await getSiteData();
  return (
    <html lang={params.locale} dir={params.locale === "ar" ? "rtl" : "ltr"} className={fontVars}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss(settings.colors) }} />
        <link rel="preconnect" href="https://images.pexels.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
