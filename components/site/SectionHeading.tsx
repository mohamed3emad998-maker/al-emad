import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  locale,
  tone = "dark",
  align = "start",
  className,
  titleClassName,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  locale: Locale;
  tone?: "dark" | "light";
  align?: "start" | "center";
  className?: string;
  titleClassName?: string;
}) {
  const onDark = tone === "light";
  return (
    <Reveal className={cn(align === "center" && "text-center", className)}>
      <p
        className={cn(
          "eyebrow",
          align === "center" && "eyebrow-center justify-center",
          onDark ? "text-silver" : "text-slate-500"
        )}
        dir="ltr"
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-5 text-balance font-bold leading-[1.15]",
          locale === "en" ? "font-wide text-[30px] sm:text-4xl lg:text-[46px]" : "text-[30px] sm:text-4xl lg:text-[44px]",
          onDark ? "text-white" : "text-navy",
          titleClassName
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-4 max-w-2xl text-base leading-8 sm:text-[17px]", align === "center" && "mx-auto", onDark ? "text-silver/90" : "text-slate-600")}>
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
