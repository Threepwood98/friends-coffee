import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Escribe tu correo electrónico.")
  .max(254, "El correo electrónico es demasiado largo.")
  .email("Escribe un correo electrónico válido.")
  .toLowerCase();

const loginPasswordSchema = z
  .string()
  .min(1, "Escribe tu contraseña.")
  .max(128, "La contraseña es demasiado larga.");

const registrationPasswordSchema = loginPasswordSchema.min(
  8,
  "La contraseña debe tener al menos 8 caracteres.",
);

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const registrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(60, "El nombre no puede superar los 60 caracteres."),
    email: emailSchema,
    password: registrationPasswordSchema,
    confirmPassword: loginPasswordSchema,
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export interface AuthActionState {
  message?: string;
}

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;

export function getSafeCallbackUrl(value: unknown) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (typeof candidate !== "string" || !candidate.startsWith("/")) {
    return "/menu";
  }

  try {
    const parsedUrl = new URL(candidate, "http://local");

    if (parsedUrl.origin !== "http://local") {
      return "/menu";
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return "/menu";
  }
}
