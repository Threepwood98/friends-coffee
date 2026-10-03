import { hashPassword, verifyPassword } from "better-auth/crypto";
import { describe, expect, it } from "vitest";

import {
  getLoginActionErrorMessage,
  getOAuthErrorMessage,
  isExistingUserError,
} from "./auth-errors";
import {
  getSafeCallbackUrl,
  loginSchema,
  registrationSchema,
} from "./validators/auth";
import { resolveUserRole, userRoleSchema } from "./validators/user";

describe("authentication validators", () => {
  it("normalizes valid registration data", () => {
    const result = registrationSchema.parse({
      name: "  Ana García  ",
      email: "  ANA@EXAMPLE.COM  ",
      password: "StrongCoffee!2026",
      confirmPassword: "StrongCoffee!2026",
    });

    expect(result.name).toBe("Ana García");
    expect(result.email).toBe("ana@example.com");
  });

  it("rejects password mismatches and values outside Better Auth's limits", () => {
    expect(
      registrationSchema.safeParse({
        name: "Ana García",
        email: "ana@example.com",
        password: "StrongCoffee!2026",
        confirmPassword: "DifferentCoffee!2026",
      }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({
        email: "ana@example.com",
        password: "a".repeat(129),
      }).success,
    ).toBe(false);
  });

  it("accepts Better Auth's default password length boundaries", () => {
    const base = {
      name: "Ana García",
      email: "ana@example.com",
    };

    expect(
      registrationSchema.safeParse({
        ...base,
        password: "12345678",
        confirmPassword: "12345678",
      }).success,
    ).toBe(true);
    expect(
      registrationSchema.safeParse({
        ...base,
        password: "a".repeat(128),
        confirmPassword: "a".repeat(128),
      }).success,
    ).toBe(true);
  });

  it("allows only same-origin callback paths", () => {
    expect(getSafeCallbackUrl("/menu/cafe?tab=opiniones#comentarios")).toBe(
      "/menu/cafe?tab=opiniones#comentarios",
    );
    expect(getSafeCallbackUrl("https://example.com/admin")).toBe("/menu");
    expect(getSafeCallbackUrl("//example.com/admin")).toBe("/menu");
    expect(getSafeCallbackUrl("/\\example.com/admin")).toBe("/menu");
  });
});

describe("Better Auth integration", () => {
  it("hashes and verifies passwords with the default provider", async () => {
    const password = "CentralPerk2026";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    await expect(verifyPassword({ hash, password })).resolves.toBe(true);
    await expect(
      verifyPassword({ hash, password: "incorrect-password" }),
    ).resolves.toBe(false);
  });

  it("maps Better Auth API errors to safe Spanish messages", () => {
    expect(getLoginActionErrorMessage("INVALID_PASSWORD", 401)).toBe(
      "El correo o la contraseña no son correctos.",
    );
    expect(getLoginActionErrorMessage(undefined, 429)).toContain(
      "demasiados intentos",
    );
    expect(isExistingUserError("USER_ALREADY_EXISTS")).toBe(true);
    expect(isExistingUserError("FAILED_TO_CREATE_USER")).toBe(false);
  });

  it("maps OAuth callback errors without exposing internal details", () => {
    expect(getOAuthErrorMessage("access_denied")).toBe(
      "No se ha autorizado el acceso con esa cuenta.",
    );
    expect(getOAuthErrorMessage("email_not_found")).toContain("correo válido");
    expect(getOAuthErrorMessage("unexpected_provider_error")).toBe(
      "No hemos podido completar el acceso. Inténtalo de nuevo.",
    );
  });
});

describe("authorization roles", () => {
  it("accepts known roles and safely downgrades invalid values", () => {
    expect(userRoleSchema.parse("ADMIN")).toBe("ADMIN");
    expect(resolveUserRole("ADMIN")).toBe("ADMIN");
    expect(resolveUserRole("OWNER")).toBe("USER");
    expect(resolveUserRole(undefined)).toBe("USER");
  });
});
