import { manual } from "./manual";
import { mercadopago } from "./mercadopago";
import type { PaymentProvider } from "./types";
export type { PaymentProvider } from "./types";
// Um único lugar escolhe o provedor. Sem credenciais, cai no modo manual.
export const getProvider = (id: "manual" | "mercadopago" = "manual"): PaymentProvider => (id === "mercadopago" && mercadopago.disponivel() ? mercadopago : manual);
