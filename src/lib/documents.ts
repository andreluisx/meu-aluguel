import type { createClient } from "@/lib/supabase/server";

type SB = Awaited<ReturnType<typeof createClient>>;
const MAX = 10 * 1024 * 1024;
const IMAGENS = ["image/jpeg", "image/png", "image/webp"];
const nomeSeguro = (n: string) => n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);

// Confere tamanho, tipo declarado E os primeiros bytes do arquivo (não basta confiar na extensão).
export async function validarArquivo(f: File, soImagem = false): Promise<string | null> {
  if (f.size > MAX) return "O arquivo é muito grande. O limite é 10 MB.";
  if (soImagem ? !IMAGENS.includes(f.type) : !["application/pdf", ...IMAGENS].includes(f.type)) return soImagem ? "Envie uma foto (JPG, PNG ou WEBP)." : "Envie um PDF ou uma foto (JPG, PNG ou WEBP).";
  const b = new Uint8Array(await f.slice(0, 12).arrayBuffer()); const s = (i: number, n: number) => String.fromCharCode(...b.slice(i, i + n));
  const ok = f.type === "application/pdf" ? s(0, 4) === "%PDF" : f.type === "image/png" ? b[0] === 0x89 && s(1, 3) === "PNG" : f.type === "image/jpeg" ? b[0] === 0xff && b[1] === 0xd8 : s(0, 4) === "RIFF" && s(8, 4) === "WEBP";
  return ok ? null : "Este arquivo parece estar corrompido ou não é do tipo informado.";
}

export async function enviarFoto(sb: SB, userId: string, f: File): Promise<{ caminho?: string; error?: string }> {
  const caminho = `${userId}/${crypto.randomUUID()}-${nomeSeguro(f.name)}`;
  const up = await sb.storage.from("documentos").upload(caminho, f, { contentType: f.type, upsert: false });
  return up.error ? { error: "Não conseguimos enviar o arquivo agora. Tente novamente." } : { caminho };
}

type Meta = { property_id?: string; charge_id?: string; lease_id?: string; tipo: string; visivel_inquilino?: boolean };
export async function salvarArquivo(sb: SB, userId: string, f: File, meta: Meta): Promise<{ error?: string }> {
  const up = await enviarFoto(sb, userId, f); if (!up.caminho) return { error: up.error };
  const ins = await sb.from("documents").insert({ ...meta, nome_arquivo: f.name.slice(0, 120), caminho: up.caminho, tamanho: f.size, tipo_mime: f.type });
  if (ins.error) { await sb.storage.from("documentos").remove([up.caminho]); return { error: "Não conseguimos guardar o arquivo agora. Tente novamente." }; }
  return {};
}
