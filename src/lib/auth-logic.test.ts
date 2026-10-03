import { describe, expect, it } from "vitest";

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

  it("allows only same-origin callback paths", () => {
    expect(getSafeCallbackUrl("/menu/cafe?tab=opiniones#comentarios")).toBe(
      "/menu/cafe?tab=opiniones#comentarios",
    );
    expect(getSafeCallbackUrl("https://example.com/admin")).toBe("/menu");
    expect(getSafeCallbackUrl("//example.com/admin")).toBe("/menu");
    expect(getSafeCallbackUrl("/\\example.com/admin")).toBe("/menu");
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
