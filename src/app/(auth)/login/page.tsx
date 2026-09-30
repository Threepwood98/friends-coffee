import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isGoogleAuthConfigured } from "@/auth";
import { GoogleSignInForm } from "@/components/auth/google-sign-in-form";
import { LoginForm } from "@/components/auth/login-form";
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
  title: "Acceso",
  description:
    "Accede a tu cuenta para participar en la carta de la cafetería.",
};

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string | string[];
    error?: string | string[];
    code?: string | string[];
  }>;
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getLoginErrorMessage(
  error: string | undefined,
  code: string | undefined,
) {
  if (!error) {
    return undefined;
  }

  if (code === "rate_limit") {
    return "Has hecho demasiados intentos. Espera unos minutos antes de volver a probar.";
  }

  if (error === "OAuthAccountNotLinked") {
    return "Ese correo ya está asociado a otra forma de acceso. Entra con el método que usaste al crear la cuenta.";
  }

  if (error === "AccessDenied") {
    return "No se ha autorizado el acceso con esa cuenta.";
  }

  if (error === "CredentialsSignin") {
    return "El correo o la contraseña no son correctos.";
  }

  return "No hemos podido completar el acceso. Inténtalo de nuevo.";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
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

  const initialMessage = getLoginErrorMessage(
    getFirstValue(params.error),
    getFirstValue(params.code),
  );

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-muted/30 px-4 py-10 sm:px-6">
      <Card className="w-full max-w-md [--card-spacing:--spacing(6)]">
        <CardHeader className="text-center">
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            Tu mesa te espera
          </p>
          <CardTitle>
            <h1 className="text-2xl font-semibold tracking-tight">
              Entra en tu cuenta
            </h1>
          </CardTitle>
          <CardDescription>
            Valora tus cafés favoritos y únete a la conversación.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <LoginForm
            callbackUrl={callbackUrl}
            initialMessage={initialMessage}
          />

          {isGoogleAuthConfigured ? (
            <>
              <FieldSeparator>o continúa con</FieldSeparator>
              <GoogleSignInForm callbackUrl={callbackUrl} />
            </>
          ) : null}
        </CardContent>

        <CardFooter className="justify-center text-center text-sm text-muted-foreground">
          ¿Aún no tienes cuenta?&nbsp;
          <Link
            href={`/registro?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-medium text-foreground underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Regístrate
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
