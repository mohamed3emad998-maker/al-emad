"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale, NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

export function Navbar({
  locale,
  nav,
  cta,
  tagline,
  logoUrl,
  menuLabel,
}: {
  locale: Locale;
  nav: NavItem[];
  cta: string;
  tagline: string;
  logoUrl: string | null;
  menuLabel: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("#home");
  const items = nav.filter((n) => n.visible);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in view
  useEffect(() => {
    const ids = items.map((i) => i.href).filter((h) => h.startsWith("#"));
    const els = ids.map((h) => document.querySelector(h)).filter(Boolean) as Element[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const other: Locale = locale === "ar" ? "en" : "ar";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open
          ? "border-b border-white/10 bg-navy/90 shadow-[0_10px_40px_-20px_rgba(0,0,0,.6)] backdrop-blur-xl"
          : "border-b border-white/[0.06] bg-gradient-to-b from-navy/70 to-transparent"
      )}
    >
      <nav className="container flex h-[76px] items-center justify-between gap-6" aria-label="Main">
        <Link href={`/${locale}#home`} className="shrink-0" aria-label="AL-EMAD">
          <Logo logoUrl={logoUrl} tagline={tagline} />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-[15px] font-medium transition-colors xl:px-4",
                  active === item.href ? "text-white" : "text-white/75 hover:text-white"
                )}
              >
                {locale === "ar" ? item.label_ar : item.label_en}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-[2px] origin-center bg-racing transition-transform duration-300 xl:inset-x-4",
                    active === item.href ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <LangSwitch locale={locale} other={other} />
          <a href="#booking" className="btn-red hidden whitespace-nowrap px-5 py-3 text-sm sm:inline-flex">
            {cta}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-[3px] border border-white/15 text-white lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={menuLabel}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100dvh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-navy lg:hidden"
          >
            <ul className="container flex flex-col gap-1 pb-10 pt-4">
              {items.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                >
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-white/10 py-4 text-xl font-semibold text-white"
                  >
                    {locale === "ar" ? item.label_ar : item.label_en}
                    <span className="h-px w-6 bg-racing" />
                  </a>
                </motion.li>
              ))}
              <li className="pt-6">
                <a href="#booking" onClick={() => setOpen(false)} className="btn-red w-full">
                  {cta}
                </a>
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function LangSwitch({ locale, other }: { locale: Locale; other: Locale }) {
  return (
    <Link
      href={`/${other}`}
      hrefLang={other}
      className="flex h-11 items-center gap-1 rounded-full border border-white/20 p-1 text-[13px] font-bold"
      aria-label={other === "en" ? "Switch to English" : "التبديل إلى العربية"}
      dir="ltr"
    >
      <span className={cn("grid h-9 w-9 place-items-center rounded-full transition", locale === "ar" ? "bg-white text-navy" : "text-white/80")}>ع</span>
      <span className={cn("grid h-9 w-9 place-items-center rounded-full font-wide text-[11px] transition", locale === "en" ? "bg-white text-navy" : "text-white/80")}>EN</span>
    </Link>
  );
}
