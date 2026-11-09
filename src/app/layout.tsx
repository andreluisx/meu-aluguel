import type { Metadata, Viewport } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunito = Nunito_Sans({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: { default: "Meu Aluguel — Seus aluguéis organizados", template: "%s | Meu Aluguel" },
  description: "Organize imóveis, inquilinos e recebimentos em um só lugar. Saiba quem pagou, acompanhe atrasos e envie lembretes pelo WhatsApp.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#315442" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
