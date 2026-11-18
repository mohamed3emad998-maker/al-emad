import { cn } from "@/lib/utils";

type Props = {
  logoUrl?: string | null;
  tagline?: string;
  className?: string;
  /** "light" = white text (dark backgrounds) */
  tone?: "light" | "dark";
  size?: "sm" | "md";
};

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 28" aria-hidden className={cn("h-7 w-8 shrink-0", className)}>
      <path d="M10 0h6L8 28H2z" className="fill-racing" />
      <path d="M22 0h6l-8 28h-6z" className="fill-silver" />
    </svg>
  );
}

export function Logo({ logoUrl, tagline, className, tone = "light", size = "md" }: Props) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt="AL-EMAD" className={cn(size === "sm" ? "h-9" : "h-11", "w-auto", className)} />
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-3", className)} dir="ltr">
      <LogoMark className={size === "sm" ? "h-6 w-7" : undefined} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-wide font-extrabold tracking-[0.04em]",
            size === "sm" ? "text-lg" : "text-[22px]",
            tone === "light" ? "text-white" : "text-navy"
          )}
        >
          AL-EMAD
        </span>
        {tagline ? (
          <span
            className={cn(
              "mt-1 text-[10px] font-medium",
              /[؀-ۿ]/.test(tagline) ? "text-[11px]" : "font-wide uppercase tracking-[0.22em]",
              tone === "light" ? "text-silver" : "text-slate-500"
            )}
          >
            {tagline}
          </span>
        ) : null}
      </span>
    </span>
  );
}
