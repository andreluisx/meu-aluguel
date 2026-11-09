import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { Onboarding } from "@/components/auth/Onboarding";

export const metadata: Metadata = { title: "Primeiros passos" };
export default function Page() { return <AuthShell><Onboarding /></AuthShell>; }
