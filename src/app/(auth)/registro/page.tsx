import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isGoogleAuthConfigured } from "@/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleSignInForm } from "@/components/auth/google-sign-in-form";
import { RegisterForm } from "@/components/auth/register-form";
import { FieldSeparator } from "@/components/ui/field";
import { getCurrentUser } from "@/lib/auth";
import { getSafeCallbackUrl } from "@/lib/validators/auth";

export const metadata: Metadata = {
  title: "Registro",
  description: "Crea una cuenta para valorar y comentar los productos.",
};

interface RegistrationPageProps {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
}

export default async function RegistrationPage({
  searchParams,
}: RegistrationPageProps) {
  const params = await searchParams;
  const callbackUrl = getSafeCallbackUrl(params.callbackUrl);
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(
      callbackUrl === "/" && currentUser.role === "ADMIN"
        ? "/admin"
        : callbackUrl,
    );
  }

  return (
    <AuthShell
      eyebrow="Haz sitio en el sofá"
      title="Crea tu cuenta"
      description="Guarda tus valoraciones y comparte cada sobremesa."
      footer={
        <>
          ¿Ya tienes cuenta?&nbsp;
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-medium text-foreground underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Entra aquí
          </Link>
        </>
      }
    >
      <RegisterForm callbackUrl={callbackUrl} />

      {isGoogleAuthConfigured ? (
        <>
          <FieldSeparator>o continúa con</FieldSeparator>
          <GoogleSignInForm callbackUrl={callbackUrl} />
        </>
      ) : null}
    </AuthShell>
  );
}
