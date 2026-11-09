import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/ResetForm";

export const metadata: Metadata = { title: "Recuperar senha" };
export default function Page() { return <AuthShell><ResetForm /></AuthShell>; }
