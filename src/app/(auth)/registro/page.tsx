import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isGoogleAuthConfigured } from "@/auth";
import { GoogleSignInForm } from "@/components/auth/google-sign-in-form";
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <main className="flex min-h-screen flex-1 items-center justify-center bg-muted/30 px-4 py-10 sm:px-6">
      <Card className="w-full max-w-md [--card-spacing:--spacing(6)]">
        <CardHeader className="text-center">
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            Haz sitio en el sofá
          </p>
          <CardTitle>
            <h1 className="text-2xl font-semibold tracking-tight">
              Crea tu cuenta
            </h1>
          </CardTitle>
          <CardDescription>
            Guarda tus valoraciones y comparte cada sobremesa.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <RegisterForm callbackUrl={callbackUrl} />

          {isGoogleAuthConfigured ? (
            <>
              <FieldSeparator>o continúa con</FieldSeparator>
              <GoogleSignInForm callbackUrl={callbackUrl} />
            </>
          ) : null}
        </CardContent>

        <CardFooter className="justify-center text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?&nbsp;
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-medium text-foreground underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Entra aquí
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
