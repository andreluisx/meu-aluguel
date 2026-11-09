import { useId } from "react";

type Tone = "light" | "dark"; // light = fundo claro · dark = fundo verde/escuro
type Variant = "horizontal" | "compact" | "icon";

export function LogoMark({ tone = "light", className, title }: { tone?: Tone; className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  const roof = tone === "dark" ? "#FFFFFF" : "#315442";
  const body = tone === "dark" ? "#315442" : "#FAF9F3";
  return (
    <svg viewBox="0 0 100 80" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={`${id}v`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8BC34A" /><stop offset="1" stopColor="#5E9A2E" /></linearGradient>
        <linearGradient id={`${id}j`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFC52F" /><stop offset="1" stopColor="#F4A912" /></linearGradient>
      </defs>
      <rect x="76" y="8.5" width="11.5" height="19" rx="2" fill={roof} />
      <rect x="15" y="36" width="9.5" height="25" rx="1.2" fill={roof} />
      <rect x="77.5" y="34" width="8" height="22" rx="1.2" fill={roof} />
      <path d="M19.4 36 50.4 14 78.3 33.3V58H24Z" fill={body} />
      <path d="M8.5 36 50.4 5.2 91.5 36" fill="none" stroke={roof} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <g fill={`url(#${id}j)`}>
        <rect x="39.2" y="27.9" width="10.2" height="9.6" rx="3" /><rect x="51.6" y="27.9" width="10.2" height="9.6" rx="3" />
        <rect x="39.2" y="39.3" width="10.2" height="9.6" rx="3" /><rect x="51.6" y="39.3" width="10.2" height="9.6" rx="3" />
      </g>
      <path d="M0 67.4C22 61 40 51 56 50.4 70 50 84 53 90.4 57.8 70 52 44 62 21 74 12 74.6 5 71.6 0 67.4Z" fill={`url(#${id}v)`} />
      <path d="M33.3 75.5C50 64 78 60.5 100 65.6 82 66.6 56 70.5 33.3 75.5Z" fill={`url(#${id}j)`} />
    </svg>
  );
}

export function Logo({ variant = "horizontal", tone = "light", className = "" }: { variant?: Variant; tone?: Tone; className?: string }) {
  if (variant === "icon") return <LogoMark tone={tone} title="Meu Aluguel" className={`h-10 w-auto ${className}`} />;
  const text = tone === "dark" ? "text-white" : "text-verde";
  if (variant === "compact")
    return (
      <span className={`inline-flex items-center gap-2.5 font-extrabold tracking-tight text-2xl ${text} ${className}`}>
        <LogoMark tone={tone} className="h-9 w-auto" />Meu Aluguel
      </span>
    );
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} aria-label="Meu Aluguel">
      <LogoMark tone={tone} className="h-20 w-auto" />
      <span className={`inline-flex flex-col font-extrabold leading-[0.92] tracking-tight text-4xl ${text}`}>
        <span>Meu<br />Aluguel</span>
        <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="mt-1.5 h-2.5 w-full" aria-hidden="true"><path d="M0 8C30 1 70 0 100 6 70 3 30 4 0 8Z" fill="#F4B942" /></svg>
      </span>
    </span>
  );
}
