import { Building2 } from "lucide-react";

export function Avatar({ url, nome, size = 56 }: { url?: string | null; nome: string; size?: number }) {
  const ini = nome.split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
  return url
    ? <img src={url} alt={`Foto de ${nome}`} width={size} height={size} loading="lazy" className="flex-none rounded-full object-cover" style={{ width: size, height: size }} />
    : <span aria-hidden className="grid flex-none place-items-center rounded-full bg-verde-suave font-extrabold text-verde" style={{ width: size, height: size }}>{ini}</span>;
}
export function Miniatura({ url, nome, size = 72 }: { url?: string | null; nome: string; size?: number }) {
  return url
    ? <img src={url} alt={`Foto do imóvel ${nome}`} width={size} height={size} loading="lazy" className="flex-none rounded-xl object-cover" style={{ width: size, height: size }} />
    : <span aria-hidden className="grid flex-none place-items-center rounded-xl bg-verde-suave text-verde" style={{ width: size, height: size }}><Building2 size={size / 2.4} /></span>;
}
