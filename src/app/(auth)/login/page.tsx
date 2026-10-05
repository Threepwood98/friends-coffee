import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthFrame } from "@/components/auth/auth-frame";
import { GoogleSignInForm } from "@/components/auth/google-sign-in-form";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";
import { getOAuthErrorMessage } from "@/lib/auth-errors";
import { isGoogleAuthConfigured } from "@/lib/auth.server";
import { getSafeCallbackUrl } from "@/lib/validators/auth";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Acceso",
  description:
    "Accede a tu cuenta para participar en la carta de la cafetería.",
};

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string | string[];
    error?: string | string[];
  }>;
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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

  const initialMessage = getOAuthErrorMessage(getFirstValue(params.error));

  return (
    <AuthFrame title="Entra en tu cuenta">
      <LoginForm
        callbackUrl={callbackUrl}
        initialMessage={initialMessage}
        googleSignIn={
          <>
            <div className="relative text-xs">
              <Separator className="absolute inset-0 top-1/2" />
              <span className="relative mx-auto block w-fit bg-door px-2 text-muted-foreground">
                o continúa con
              </span>
            </div>
            <GoogleSignInForm
              callbackUrl={callbackUrl}
              disabled={!isGoogleAuthConfigured}
              label="Google"
            />
          </>
        }
      />
    </AuthFrame>
  );
}
