import { NextResponse } from "next/server";
import { assinaturaValida } from "@/lib/payments/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

// Recebe avisos do Mercado Pago. IMPORTANTE: este endpoint ainda NÃO confirma nenhum pagamento.
// Ele valida a assinatura e guarda o aviso (uma vez só). A baixa do aluguel exigirá consultar o pagamento
// na API do Mercado Pago com o token do proprietário e só então gravar em `payments` (provider_payment_id único).
export async function POST(req: Request) {
  const segredo = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!segredo || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: false, motivo: "nao_configurado" }, { status: 503 });
  const corpo = await req.json().catch(() => null) as { id?: string | number; type?: string; action?: string; data?: { id?: string } } | null;
  const dataId = new URL(req.url).searchParams.get("data.id") ?? corpo?.data?.id;
  if (!corpo || !dataId || !assinaturaValida(req.headers, String(dataId), segredo)) return NextResponse.json({ ok: false }, { status: 401 });
  const eventId = String(corpo.id ?? `${corpo.type}:${dataId}:${corpo.action ?? ""}`);
  await createAdminClient().from("payment_events").upsert({ provider: "mercadopago", event_id: eventId, payload: corpo }, { onConflict: "provider,event_id", ignoreDuplicates: true });
  return NextResponse.json({ ok: true });
}
