"use client";
import { createContext, useContext, useState } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { maskInfo, masks, type MaskName } from "@/lib/masks";

export const FormCtx = createContext<{ errors: Record<string, string>; values: Record<string, string> }>({ errors: {}, values: {} });

const box = "h-14 w-full min-w-0 max-w-full rounded-xl border-2 bg-white px-4 text-[1.05rem] text-texto";
const cls = (e?: string) => `${box} ${e ? "border-erro-texto bg-[#F8E3E0]" : "border-[#BDB9A6]"}`;

function Wrap({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="mb-5 min-w-0">
      <label htmlFor={id} className="mb-1.5 block font-bold">{label}</label>
      {children}
      {hint && <p id={`${id}-h`} className="mt-1 text-[.95rem] text-texto-2">{hint}</p>}
      {error && <p id={`${id}-e`} role="alert" className="mt-1.5 font-bold text-erro-texto">! {error}</p>}
    </div>
  );
}
type P = InputHTMLAttributes<HTMLInputElement> & { name: string; label: string; hint?: string; error?: string; mask?: MaskName };
const desc = (id: string, e?: string, h?: string) => (e ? `${id}-e` : h ? `${id}-h` : undefined);

export function Field({ label, hint, error: e, mask, onChange, ...r }: P) {
  const ctx = useContext(FormCtx);
  const error = e ?? ctx.errors[r.name]; const id = r.id ?? r.name;
  const mi = mask ? maskInfo[mask] : undefined;
  const dv = r.value === undefined ? (ctx.values[r.name] ?? r.defaultValue) : undefined;
  const handle = (ev: ChangeEvent<HTMLInputElement>) => { if (mask) ev.target.value = masks[mask](ev.target.value); onChange?.(ev); };
  return (<Wrap id={id} label={label} hint={hint} error={error}>
    <input id={id} {...r} defaultValue={dv} onChange={handle} maxLength={mi?.max ?? r.maxLength} inputMode={r.inputMode ?? mi?.mode}
      placeholder={r.placeholder ?? mi?.placeholder} aria-invalid={!!error} aria-describedby={desc(id, error, hint)} className={cls(error)} />
  </Wrap>);
}
export function PasswordField({ label, hint, error: e, ...r }: P) {
  const [show, setShow] = useState(false);
  const ctx = useContext(FormCtx); const error = e ?? ctx.errors[r.name]; const id = r.id ?? r.name;
  return (<Wrap id={id} label={label} hint={hint} error={error}>
    <div className="relative">
      <input id={id} {...r} type={show ? "text" : "password"} aria-invalid={!!error} aria-describedby={desc(id, error, hint)} className={`${cls(error)} pr-32`} />
      <button type="button" onClick={() => setShow(!show)} aria-pressed={show} className="absolute right-1.5 top-1.5 inline-flex min-h-11 items-center gap-1.5 rounded-[10px] bg-verde-suave px-3 text-[.95rem] font-bold">{show ? <><EyeOff size={18} aria-hidden />Esconder</> : <><Eye size={18} aria-hidden />Mostrar</>}</button>
    </div>
  </Wrap>);
}
export function SelectField({ label, hint, error: e, children, ...r }: SelectHTMLAttributes<HTMLSelectElement> & { name: string; label: string; hint?: string; error?: string }) {
  const ctx = useContext(FormCtx); const error = e ?? ctx.errors[r.name]; const id = r.id ?? r.name;
  const dv = r.value === undefined ? (ctx.values[r.name] ?? r.defaultValue) : undefined;
  return (<Wrap id={id} label={label} hint={hint} error={error}><div className="relative"><select id={id} {...r} defaultValue={dv} aria-invalid={!!error} aria-describedby={desc(id, error, hint)} className={`${cls(error)} pr-11`}>{children}</select><ChevronDown size={22} aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-texto-2" /></div></Wrap>);
}

async function reduzirImagem(f: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return f;
  try {
    const bmp = await createImageBitmap(f); const k = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.82));
    return blob && blob.size < f.size ? new File([blob], f.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : f;
  } catch { return f; }
}
// Fotos são reduzidas no próprio aparelho antes do envio (economiza internet e deixa o sistema rápido).
export function FileField({ label, hint, name = "arquivo", fotos, multiple }: { label: string; hint?: string; name?: string; fotos?: boolean; multiple?: boolean }) {
  const ctx = useContext(FormCtx); const error = ctx.errors[name]; const id = `${name}-f`;
  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const el = e.target; const dt = new DataTransfer();
    for (const f of Array.from(el.files ?? [])) dt.items.add(await reduzirImagem(f));
    el.files = dt.files;
  }
  return (<Wrap id={id} label={label} hint={hint} error={error}>
    <input id={id} name={name} type="file" multiple={multiple} onChange={onChange} accept={fotos ? "image/png,image/jpeg,image/webp" : ".pdf,image/png,image/jpeg,image/webp"} aria-invalid={!!error} aria-describedby={desc(id, error, hint)}
      className="w-full rounded-xl border-2 border-[#BDB9A6] bg-white p-3 text-[1.05rem] file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-verde-suave file:px-4 file:font-bold" />
  </Wrap>);
}
