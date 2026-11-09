import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { TenantLoginForm } from "@/components/auth/TenantLoginForm";

export const metadata: Metadata = { title: "Acesso do inquilino" };
export default function Page() { return <AuthShell><TenantLoginForm /></AuthShell>; }
