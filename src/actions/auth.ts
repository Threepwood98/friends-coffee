"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, isGoogleAuthConfigured } from "@/lib/auth.server";
import {
  getSafeCallbackUrl,
  loginSchema,
  registrationSchema,
  type AuthActionState,
} from "@/lib/validators/auth";

function getAuthErrorCode(error: APIError) {
  const code = error.body?.code;

  return typeof code === "string" ? code : undefined;
}

function getLoginErrorMessage(error: APIError) {
  const code = getAuthErrorCode(error);

  if (
    code === "INVALID_EMAIL_OR_PASSWORD" ||
    code === "INVALID_PASSWORD" ||
    code === "USER_NOT_FOUND"
  ) {
    return "El correo o la contraseña no son correctos.";
  }

  if (error.statusCode === 429) {
    return "Has hecho demasiados intentos. Espera unos minutos antes de volver a probar.";
  }

  return "No hemos podido iniciar sesión. Inténtalo de nuevo.";
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!credentials.success) {
    return {
      message:
        credentials.error.issues[0]?.message ??
        "Revisa los datos del formulario.",
    };
  }

  try {
    await auth.api.signInEmail({
      body: credentials.data,
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      return { message: getLoginErrorMessage(error) };
    }

    console.error("Login failed.", error);
    return { message: "No hemos podido iniciar sesión. Inténtalo de nuevo." };
  }

  redirect(getSafeCallbackUrl(formData.get("callbackUrl")));
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const registration = registrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!registration.success) {
    return {
      message:
        registration.error.issues[0]?.message ??
        "Revisa los datos del formulario.",
    };
  }

  const { name, email, password } = registration.data;

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      const code = getAuthErrorCode(error);

      if (
        code === "USER_ALREADY_EXISTS" ||
        code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
      ) {
        return {
          message: "Ya existe una cuenta con ese correo electrónico.",
        };
      }
    }

    console.error("Registration failed.", error);
    return {
      message: "No hemos podido crear la cuenta. Inténtalo de nuevo.",
    };
  }

  redirect(getSafeCallbackUrl(formData.get("callbackUrl")));
}

export async function signInWithGoogleAction(formData: FormData) {
  if (!isGoogleAuthConfigured) {
    return;
  }

  const callbackURL = getSafeCallbackUrl(formData.get("callbackUrl"));
  const errorCallbackURL = `/login?callbackUrl=${encodeURIComponent(callbackURL)}`;
  const result = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL,
      errorCallbackURL,
    },
    headers: await headers(),
  });

  redirect(result.url ?? `${errorCallbackURL}&error=OAUTH_SIGN_IN_FAILED`);
}

export async function logoutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/menu");
}
