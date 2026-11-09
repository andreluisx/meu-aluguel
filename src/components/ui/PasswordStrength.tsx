import { senhaForca } from "@/lib/password";

const info = { fraca: ["Senha fraca", 1, "bg-erro"], media: ["Senha média", 2, "bg-dourado"], forte: ["Senha forte", 3, "bg-verde-claro"] } as const;
export function PasswordStrength({ senha }: { senha: string }) {
  if (!senha) return null;
  const f = senhaForca(senha); const [label, n, cor] = info[f.nivel];
  return (
    <div aria-live="polite" className="-mt-2 mb-5">
      <div className="flex gap-1.5" aria-hidden>{[1, 2, 3].map((i) => <span key={i} className={`h-2 flex-1 rounded-full ${i <= n ? cor : "bg-borda"}`} />)}</div>
      <p className="mt-1.5 font-bold">{label}</p>
      <ul className="mt-1 grid gap-0.5 text-[.95rem] text-texto-2">{f.itens.map((i) => <li key={i.t}>{i.ok ? "✓" : "○"} {i.t}</li>)}</ul>
    </div>
  );
}
