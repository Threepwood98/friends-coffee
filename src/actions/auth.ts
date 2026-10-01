"use server";

import { Prisma } from "@prisma/client";
import { hash } from "bcrypt";
import { headers } from "next/headers";
import { AuthError, CredentialsSignin } from "next-auth";

import { isGoogleAuthConfigured, signIn, signOut } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import {
  clearLoginIdentityRateLimit,
  consumeRegistrationRateLimit,
} from "@/lib/rate-limit";
import {
  getSafeCallbackUrl,
  loginSchema,
  registrationSchema,
  type AuthActionState,
} from "@/lib/validators/auth";

const BCRYPT_COST = 12;

function getAuthErrorMessage(error: AuthError) {
  if (error instanceof CredentialsSignin) {
    return error.code === "rate_limit"
      ? "Has hecho demasiados intentos. Espera unos minutos antes de volver a probar."
      : "El correo o la contraseña no son correctos.";
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
    await signIn("credentials", {
      ...credentials.data,
      redirectTo: getSafeCallbackUrl(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: getAuthErrorMessage(error) };
    }

    throw error;
  }

  return {};
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

  const requestHeaders = await headers();
  const { name, email, password } = registration.data;
  const rateLimit = consumeRegistrationRateLimit(requestHeaders, email);

  if (!rateLimit.allowed) {
    return {
      message:
        "Has creado demasiadas cuentas recientemente. Espera antes de volver a intentarlo.",
    };
  }

  try {
    const passwordHash = await hash(password, BCRYPT_COST);
    const prisma = await getPrisma();

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER",
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        message: "Ya existe una cuenta con ese correo electrónico.",
      };
    }

    console.error("Registration failed.", error);
    return {
      message: "No hemos podido crear la cuenta. Inténtalo de nuevo.",
    };
  }

  clearLoginIdentityRateLimit(requestHeaders, email);

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: getSafeCallbackUrl(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        message:
          "Tu cuenta se ha creado, pero no hemos podido iniciar la sesión. Accede con tus nuevos datos.",
      };
    }

    throw error;
  }

  return {};
}

export async function signInWithGoogleAction(formData: FormData) {
  if (!isGoogleAuthConfigured) {
    return;
  }

  await signIn("google", {
    redirectTo: getSafeCallbackUrl(formData.get("callbackUrl")),
  });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/menu" });
}
