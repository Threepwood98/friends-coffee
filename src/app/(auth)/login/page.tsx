import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isGoogleAuthConfigured } from "@/auth";
import { AuthFrame } from "@/components/auth/auth-frame";
import { GoogleSignInForm } from "@/components/auth/google-sign-in-form";
import { LoginForm } from "@/components/auth/login-form";
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
      callbackUrl === "/menu" && currentUser.role === "ADMIN"
        ? "/admin"
        : callbackUrl,
    );
  }

  const initialMessage = getLoginErrorMessage(
    getFirstValue(params.error),
    getFirstValue(params.code),
  );

  return (
    <AuthFrame title="Entra en tu cuenta">
      <LoginForm
        callbackUrl={callbackUrl}
        initialMessage={initialMessage}
        googleSignIn={
          <GoogleSignInForm
            callbackUrl={callbackUrl}
            disabled={!isGoogleAuthConfigured}
            label="Iniciar sesión con Google"
          />
        }
      />
    </AuthFrame>
  );
}
