"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions, badge }: { title: string; subtitle?: ReactNode; actions?: ReactNode; badge?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[28px] font-bold leading-tight sm:text-[32px]">{title}</h1>
        {subtitle ? (
          <p className="mt-2 flex flex-wrap items-center gap-2 text-slate-500">
            {subtitle}
            {badge ? <span className="rounded-full bg-line px-3 py-0.5 text-xs font-semibold text-slate-700">{badge}</span> : null}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-md border border-line bg-white", className)}>{children}</div>;
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-[#1F6B3A]" : "bg-slate-300"
      )}
    >
      <span className={cn("absolute h-6 w-6 rounded-full bg-white shadow transition-all", checked ? "start-[26px]" : "start-1")} />
    </button>
  );
}

export function LangTabs({ value, onChange }: { value: "ar" | "en"; onChange: (v: "ar" | "en") => void }) {
  return (
    <div className="inline-flex overflow-hidden rounded-[4px] border border-line" role="tablist">
      {(["ar", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={value === l}
          onClick={() => onChange(l)}
          className={cn("px-5 py-2.5 text-sm font-semibold transition", value === l ? "bg-navy text-white" : "bg-white text-slate-600 hover:bg-paper")}
        >
          {l === "ar" ? "العربية" : "English"}
        </button>
      ))}
    </div>
  );
}

export function Counter({ value, max }: { value: string; max?: number }) {
  if (!max) return null;
  return (
    <span className={cn("font-wide text-xs", value.length > max ? "text-racing" : "text-slate-400")} dir="ltr">
      {value.length}/{max}
    </span>
  );
}

/* ---------------- Toasts ---------------- */
type Toast = { id: number; type: "success" | "error"; text: string };
const ToastCtx = createContext<(type: Toast["type"], text: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((type: Toast["type"], text: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, type, text }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-6 z-[100] flex flex-col gap-2" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className={cn(
                "pointer-events-auto flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg",
                t.type === "success" ? "bg-[#1F6B3A]" : "bg-racing"
              )}
            >
              {t.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
