import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { benefits, faqs, features, problems, solutions, steps } from "@/lib/content";
import { plans } from "@/lib/plans";
import { brl } from "@/lib/validation";
import { PhoneMockup } from "./PhoneMockup";

const W = "mx-auto max-w-[1100px] px-5";
const H2 = "mb-3.5 text-[clamp(1.7rem,4.5vw,2.5rem)] font-extrabold leading-[1.12] tracking-tight";

export function Hero() {
  return (
    <section className={`${W} grid items-center gap-10 pb-[72px] pt-12 md:grid-cols-[1.15fr_.85fr] md:pt-[72px]`}>
      <div>
        <h1 className="mb-3.5 text-[clamp(2.2rem,7vw,3.6rem)] font-extrabold leading-[1.1] tracking-tight">Seus aluguéis organizados. Sua tranquilidade em dia.</h1>
        <p className="max-w-[56ch] text-[1.15rem] text-texto-2">Tenha todos os seus imóveis, inquilinos e recebimentos organizados em um só lugar. Saiba quem pagou, acompanhe os atrasos e envie lembretes sem complicação.</p>
        <div className="mt-6 flex flex-wrap gap-3"><ButtonLink href="/cadastro">Quero organizar meus aluguéis</ButtonLink><ButtonLink href="#como" variant="outline">Conhecer o sistema</ButtonLink></div>
      </div>
      <PhoneMockup />
    </section>
  );
}
export function Problem() {
  return (
    <section className="bg-white py-[72px]"><div className={`${W} grid items-start gap-7 md:grid-cols-2`}>
      <div><h2 className={H2}>Administrar imóveis não deveria dar tanto trabalho.</h2><p className="max-w-[56ch] text-[1.15rem] text-texto-2">Quando tudo fica em cadernos, mensagens e papéis soltos, a rotina cansa. Você provavelmente já passou por isso:</p>
        <ul className="mt-4 grid gap-3">{problems.map((p) => <li key={p} className="flex gap-3"><span className="font-extrabold text-texto-2">–</span>{p}</li>)}</ul></div>
      <div className="rounded-[18px] border border-borda bg-white p-6 shadow-sm"><h3 className="text-xl font-bold">Com o Meu Aluguel</h3>
        <ul className="mt-4 grid gap-3">{solutions.map((p) => <li key={p} className="flex gap-3"><span className="font-extrabold text-[#27623F]">✓</span>{p}</li>)}</ul></div>
    </div></section>
  );
}
export function Steps() {
  return (
    <section id="como" className="py-[72px]"><div className={W}><h2 className={H2}>Como funciona</h2><p className="text-[1.15rem] text-texto-2">Três passos, no seu ritmo. Você pode parar e continuar depois.</p>
      <div className="mt-7 grid gap-4 md:grid-cols-3">{steps.map((s, i) => (
        <div key={s.t} className="flex gap-4"><span className="grid size-[52px] flex-none place-items-center rounded-full bg-verde text-2xl font-extrabold text-white">{i + 1}</span><div><h3 className="text-xl font-bold">{s.t}</h3><p className="text-texto-2">{s.d}</p></div></div>))}</div></div></section>
  );
}
export function Features() {
  return (
    <section id="funcionalidades" className="bg-white py-[72px]"><div className={W}><h2 className={H2}>Tudo o que você precisa para cuidar dos aluguéis</h2>
      <div className="mt-7 grid gap-x-7 md:grid-cols-2">{features.map(({ icon: I, t, d }) => (
        <div key={t} className="flex gap-4 border-t border-borda py-[18px]"><span className="grid size-14 flex-none place-items-center rounded-2xl bg-verde-suave text-verde"><I size={28} aria-hidden /></span><div><h3 className="mb-1 text-xl font-bold">{t}</h3><p className="text-texto-2">{d}</p></div></div>))}</div></div></section>
  );
}
export function Benefits() {
  return (
    <section className="bg-verde py-[72px] text-white"><div className={W}><h2 className={`${H2} text-white`}>Mais organização para quem construiu seu patrimônio.</h2>
      <ul className="mt-7 grid gap-3.5 md:grid-cols-2">{benefits.map(([t, d]) => <li key={t} className="border-l-4 border-dourado py-1 pl-[18px] text-xl font-bold">{t}<span className="block text-base font-medium text-[#DCE8DF]">{d}</span></li>)}</ul></div></section>
  );
}
export function Plans() {
  return (
    <section id="planos" className="py-[72px]"><div className={W}><h2 className={H2}>Escolha o plano para a quantidade de imóveis que você tem</h2>
      <p className="text-[1.15rem] text-texto-2">Todos os planos têm todas as funcionalidades. Muda apenas o número de imóveis.</p>
      <div className="mt-7 grid gap-[18px] md:grid-cols-3">{plans.map((p) => (
        <div key={p.id} className={`flex flex-col rounded-[18px] bg-white p-6 shadow-sm ${p.destaque ? "border-2 border-verde-2" : "border border-borda"}`}>
          {p.destaque && <span className="mb-2 self-start rounded-full bg-dourado px-3 text-sm font-extrabold text-[#2B2308]">Mais escolhido</span>}
          <h3 className="text-xl font-bold">{p.nome}</h3>
          <p className="my-2 text-[2.6rem] font-extrabold leading-tight tabular-nums">{brl(p.precoCentavos / 100)}<small className="text-base font-semibold text-texto-2">/mês</small></p>
          <ul className="mb-5 list-disc pl-5 text-texto-2"><li>Até {p.limiteImoveis} imóveis</li><li>Todas as funcionalidades</li></ul>
          <ButtonLink href={`/cadastro?plano=${p.id}`} variant={p.destaque ? "primary" : "outline"} className="mt-auto">Começar com o {p.nome}</ButtonLink>
        </div>))}</div>
      <p className="mt-4 text-[.95rem] text-texto-2">Valores iniciais de referência, sujeitos a alteração.</p></div></section>
  );
}
export function Faq() {
  return (
    <section id="faq" className="bg-white py-[72px]"><div className="mx-auto max-w-[820px] px-5"><h2 className={H2}>Perguntas frequentes</h2>
      {faqs.map(([q, a]) => (
        <details key={q} className="group border-b border-borda"><summary className="relative min-h-14 cursor-pointer list-none py-5 pr-10 text-[1.15rem] font-bold [&::-webkit-details-marker]:hidden">{q}<span aria-hidden className="absolute right-1.5 top-4 text-2xl font-extrabold text-verde-2 group-open:hidden">+</span><span aria-hidden className="absolute right-1.5 top-4 hidden text-2xl font-extrabold text-verde-2 group-open:inline">–</span></summary>
          <p className="max-w-[62ch] pb-[18px] text-texto-2">{a}</p></details>))}</div></section>
  );
}
export function SiteFooter() {
  const col = "grid gap-1.5";
  return (
    <footer className="bg-[#1F2C25] py-14 pb-8 text-[#E5EEE6]"><div className={W}>
      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div><Logo variant="compact" tone="dark" /><p className="mt-3.5 max-w-[34ch]">Seus imóveis sempre organizados. Você cuida dos seus imóveis, nós cuidamos da organização dos seus recebimentos.</p></div>
        <div><h3 className="mb-2 font-bold text-white">Sobre</h3><ul className={col}><li><a href="#como">Como funciona</a></li><li><a href="#planos">Planos</a></li><li><a href="#faq">Perguntas frequentes</a></li><li><a href="#">Contato</a></li></ul></div>
        <div><h3 className="mb-2 font-bold text-white">Informações</h3><ul className={col}><li><a href="/termos">Termos de uso</a></li><li><a href="/privacidade">Política de privacidade</a></li><li><a href="#">Instagram</a></li><li><a href="#">Facebook</a></li></ul></div>
      </div>
      <p className="mt-8 border-t border-[#364A3E] pt-5 text-[.9rem] text-[#B8C0B7]">© 2026 Meu Aluguel. Todos os direitos reservados. Razão social e CNPJ: a preencher.</p>
    </div></footer>
  );
}
