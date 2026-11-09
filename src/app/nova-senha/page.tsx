import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

export const metadata: Metadata = { title: "Nova senha" };
export default function Page() { return <AuthShell><NewPasswordForm /></AuthShell>; }
