"use client";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitRequest, type SubmitState } from "@/app/actions/submit-request";
import { BOOK_EVENT } from "@/lib/booking-bus";
import type { Dict } from "@/lib/i18n";
import { JAPANESE_BRANDS, type BookingKind, type Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  locale: Locale;
  dict: Dict;
  kind: BookingKind;
  services?: string[];
  partName?: string;
  defaultBrand?: string;
  /** listen for "Book this service" events */
  listen?: boolean;
  compact?: boolean;
};

const initial: SubmitState = { status: "idle" };

export function RequestForm({ locale, dict, kind, services = [], partName, defaultBrand, listen, compact }: Props) {
  const f = dict.form;
  const [state, action] = useFormState(submitRequest, initial);
  const [service, setService] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [minDate, setMinDate] = useState<string>();

  useEffect(() => {
    const d = new Date();
    setMinDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }, []);

  useEffect(() => {
    if (!listen) return;
    const onBook = (e: Event) => {
      const s = (e as CustomEvent<{ service: string }>).detail?.service;
      if (s) setService(s);
      setTimeout(() => formRef.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus({ preventScroll: true }), 600);
    };
    window.addEventListener(BOOK_EVENT, onBook);
    return () => window.removeEventListener(BOOK_EVENT, onBook);
  }, [listen]);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setService("");
    }
  }, [state]);

  const err = (k: keyof NonNullable<SubmitState["fieldErrors"]>) => {
    const code = state.fieldErrors?.[k];
    return code ? (f as Record<string, string>)[code] ?? code : undefined;
  };

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-center justify-center gap-4 py-14 text-center">
        <CheckCircle2 className="text-whatsapp" size={56} strokeWidth={1.5} />
        <p className="max-w-md text-lg font-semibold leading-8 text-navy">{f.success}</p>
      </div>
    );
  }

  const isBooking = kind === "booking";
  const serviceOptions = isBooking ? Array.from(new Set([...services, ...(service && !services.includes(service) ? [service] : [])])) : [];

  return (
    <form ref={formRef} action={action} noValidate className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="locale" value={locale} />
      {partName ? <input type="hidden" name="part_name" value={partName} /> : null}
      {/* honeypot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label={f.name} required error={err("name")} id={`${kind}-name`}>
        <input id={`${kind}-name`} name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder={f.namePh} className="field" aria-invalid={!!err("name")} />
      </Field>
      <Field label={f.phone} required error={err("phone")} id={`${kind}-phone`}>
        <input
          id={`${kind}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          maxLength={30}
          placeholder={f.phonePh}
          className="field text-start"
          dir="ltr"
          aria-invalid={!!err("phone")}
        />
      </Field>
      <Field label={f.brand} required={isBooking} error={err("car_brand")} id={`${kind}-brand`}>
        <select id={`${kind}-brand`} name="car_brand" defaultValue={defaultBrand ?? ""} className="field appearance-auto" aria-invalid={!!err("car_brand")}>
          <option value="">{f.brandPh}</option>
          {JAPANESE_BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
          <option value={f.other}>{f.other}</option>
        </select>
      </Field>
      <Field label={f.model} id={`${kind}-model`}>
        <input id={`${kind}-model`} name="car_model" maxLength={120} placeholder={f.modelPh} className="field" />
      </Field>

      {isBooking ? (
        <>
          <Field label={f.service} required error={err("service")} id={`${kind}-service`}>
            <select
              id={`${kind}-service`}
              name="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="field appearance-auto"
              aria-invalid={!!err("service")}
            >
              <option value="">{f.servicePh}</option>
              {serviceOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value={f.other}>{f.other}</option>
            </select>
          </Field>
          <Field label={f.date} error={err("preferred_date")} id={`${kind}-date`}>
            <input id={`${kind}-date`} name="preferred_date" type="date" min={minDate} className="field" aria-invalid={!!err("preferred_date")} />
          </Field>
        </>
      ) : (
        <input type="hidden" name="service" value={f.sparePartsService} />
      )}

      <div className="sm:col-span-2">
        <label htmlFor={`${kind}-message`} className="label">
          {f.message}
        </label>
        <textarea id={`${kind}-message`} name="message" rows={compact ? 3 : 4} maxLength={2000} placeholder={f.messagePh} className="field resize-y" />
      </div>

      <div className="flex flex-col-reverse gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-6 text-slate-500">{f.required}</p>
        <Submit label={isBooking ? f.submit : f.submitQuote} sending={f.sending} />
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="rounded-[3px] border border-racing/30 bg-racing/5 px-4 py-3 text-sm text-racing sm:col-span-2">
          {state.message === "notConnected" ? f.notConnected : f.error}
        </p>
      ) : null}
    </form>
  );
}

function Submit({ label, sending }: { label: string; sending: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-red min-w-[220px] py-4">
      {pending ? <Loader2 size={18} className="animate-spin" /> : null}
      {pending ? sending : label}
    </button>
  );
}

function Field({
  label,
  required,
  error,
  id,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(error && "[&_.field]:border-racing")}>
      <label htmlFor={id} className="label">
        {label} {required ? <span className="text-racing">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-racing" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
