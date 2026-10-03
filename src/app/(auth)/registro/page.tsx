import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthFrame } from "@/components/auth/auth-frame";
import { GoogleSignInForm } from "@/components/auth/google-sign-in-form";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth";
import { isGoogleAuthConfigured } from "@/lib/auth.server";
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
      callbackUrl === "/menu" && currentUser.role === "ADMIN"
        ? "/admin"
        : callbackUrl,
    );
  }

  return (
    <AuthFrame title="Crea tu cuenta">
      <RegisterForm
        callbackUrl={callbackUrl}
        googleSignIn={
          <GoogleSignInForm
            callbackUrl={callbackUrl}
            disabled={!isGoogleAuthConfigured}
            label="Registrarse con Google"
          />
        }
      />
    </AuthFrame>
  );
}
