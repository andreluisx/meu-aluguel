export type Forca = { nivel: "fraca" | "media" | "forte"; itens: { t: string; ok: boolean }[] };
export function senhaForca(s: string): Forca {
  const tam = s.length >= 8, letras = /[A-Za-z]/.test(s), num = /\d/.test(s);
  const mix = /[a-z]/.test(s) && /[A-Z]/.test(s), simb = /[^A-Za-z0-9]/.test(s);
  const obrig = tam && letras && num;
  const nivel = obrig && mix && (simb || s.length >= 12) ? "forte" : obrig ? "media" : "fraca";
  return { nivel, itens: [
    { t: "Pelo menos 8 caracteres", ok: tam }, { t: "Letras e números", ok: letras && num },
    { t: "Maiúscula e minúscula (deixa mais forte)", ok: mix }, { t: "Um símbolo, como ! ou @ (deixa mais forte)", ok: simb },
  ] };
}
export const senhaAceita = (s: string) => senhaForca(s).nivel !== "fraca";
