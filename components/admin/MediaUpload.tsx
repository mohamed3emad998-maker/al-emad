"use client";
import { ImageIcon, Link2, Loader2, Trash2, Upload, Video } from "lucide-react";
import { useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_VIDEO = 50 * 1024 * 1024;

/** Downscale & re-encode raster images in the browser before upload (WebP, max 1920px). */
async function compressImage(file: File, maxSide = 1920): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  return blob && blob.size < file.size ? blob : file;
}

export async function uploadToMedia(file: File, folder: string): Promise<string> {
  const isVideo = file.type.startsWith("video/");
  if (isVideo && file.size > MAX_VIDEO) throw new Error("حجم الفيديو أكبر من 50MB");
  if (!isVideo && file.size > MAX_IMAGE * 3) throw new Error("حجم الصورة كبير جدًا");
  const body = isVideo ? file : await compressImage(file);
  if (!isVideo && body.size > MAX_IMAGE) throw new Error("حجم الصورة بعد الضغط أكبر من 5MB");
  const ext = body.type === "image/webp" ? "webp" : (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const sb = getBrowserClient();
  const { error } = await sb.storage.from("media").upload(path, body, { contentType: body.type || file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
}

export function MediaUpload({
  value,
  onChange,
  folder,
  kind = "image",
  hint,
  aspect = "aspect-[4/3]",
  label,
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder: string;
  kind?: "image" | "video";
  hint?: string;
  aspect?: string;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [urlMode, setUrlMode] = useState(false);

  async function handle(file?: File) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      onChange(await uploadToMedia(file, folder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر رفع الملف");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label ? <span className="label">{label}</span> : null}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative overflow-hidden rounded-md border-2 border-dashed bg-paper transition",
          aspect,
          drag ? "border-racing bg-racing/5" : "border-slate-300"
        )}
      >
        {value ? (
          kind === "video" ? (
            <video src={value} className="absolute inset-0 h-full w-full object-cover" muted loop autoPlay playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )
        ) : (
          <div className="hatch-light absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            {kind === "video" ? <Video className="text-slate-500" /> : <Upload className="text-slate-500" />}
            <p className="text-sm font-semibold text-navy">
              اسحب {kind === "video" ? "الفيديو" : "الصورة"} هنا أو{" "}
              <button type="button" className="text-racing underline underline-offset-4" onClick={() => input.current?.click()}>
                اختر ملفًا
              </button>
            </p>
            {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
          </div>
        )}
        {busy ? (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="animate-spin text-navy" />
          </div>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => input.current?.click()} className="inline-flex items-center gap-1.5 rounded border border-line bg-white px-3 py-1.5 text-xs font-semibold hover:border-navy">
          {kind === "video" ? <Video size={14} /> : <ImageIcon size={14} />} رفع
        </button>
        <button type="button" onClick={() => setUrlMode((v) => !v)} className="inline-flex items-center gap-1.5 rounded border border-line bg-white px-3 py-1.5 text-xs font-semibold hover:border-navy">
          <Link2 size={14} /> رابط
        </button>
        {value ? (
          <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1.5 rounded border border-line bg-white px-3 py-1.5 text-xs font-semibold text-racing hover:border-racing">
            <Trash2 size={14} /> إزالة
          </button>
        ) : null}
      </div>
      {urlMode ? (
        <input
          className="field mt-2 text-sm"
          dir="ltr"
          placeholder="https://…"
          defaultValue={value ?? ""}
          onBlur={(e) => onChange(e.target.value.trim() || null)}
        />
      ) : null}
      {error ? <p className="mt-1 text-xs text-racing">{error}</p> : null}
      <input
        ref={input}
        type="file"
        hidden
        accept={kind === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/avif,image/svg+xml"}
        onChange={(e) => {
          handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
