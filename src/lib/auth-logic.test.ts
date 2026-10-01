import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getSafeCallbackUrl,
  loginSchema,
  registrationSchema,
} from "./validators/auth";
import { resolveUserRole, userRoleSchema } from "./validators/user";

interface TestRateLimitGlobal {
  authRateLimitStore?: Map<string, { attempts: number; resetAt: number }>;
  authRateLimitLastPrunedAt?: number;
}

function clearRateLimitState() {
  Reflect.deleteProperty(globalThis, "authRateLimitStore");
  Reflect.deleteProperty(globalThis, "authRateLimitLastPrunedAt");
}

async function loadRateLimiter() {
  clearRateLimitState();
  vi.resetModules();
  return import("./rate-limit");
}

function headersFor(ip: string) {
  return new Headers({ "x-forwarded-for": ip });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-29T12:00:00.000Z"));
});

afterEach(() => {
  clearRateLimitState();
  vi.useRealTimers();
});

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

  it("rejects password mismatches and values over bcrypt's byte limit", () => {
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
        password: "é".repeat(37),
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

describe("authentication rate limiting", () => {
  it("enforces identity and aggregate login limits without allocating blocked keys", async () => {
    const { consumeLoginRateLimit } = await loadRateLimiter();
    const identityHeaders = headersFor("198.51.100.10");

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      expect(
        consumeLoginRateLimit(identityHeaders, "user@example.com").allowed,
      ).toBe(true);
    }
    expect(
      consumeLoginRateLimit(identityHeaders, "user@example.com").allowed,
    ).toBe(false);

    const aggregateHeaders = headersFor("198.51.100.20");
    for (let attempt = 1; attempt <= 20; attempt += 1) {
      expect(
        consumeLoginRateLimit(aggregateHeaders, `user-${attempt}@example.com`)
          .allowed,
      ).toBe(true);
    }
    expect(
      consumeLoginRateLimit(aggregateHeaders, "blocked@example.com").allowed,
    ).toBe(false);

    const store = (globalThis as unknown as TestRateLimitGlobal)
      .authRateLimitStore;
    expect(
      store?.has("auth:login:identity:198.51.100.20:blocked@example.com"),
    ).toBe(false);
  });

  it("preserves previous IP failures after a successful login", async () => {
    const { consumeLoginRateLimit, recordSuccessfulLogin } =
      await loadRateLimiter();
    const headers = headersFor("198.51.100.30");

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      expect(consumeLoginRateLimit(headers, "user@example.com").allowed).toBe(
        true,
      );
    }
    recordSuccessfulLogin(headers, "user@example.com");

    expect(consumeLoginRateLimit(headers, "user@example.com").allowed).toBe(
      true,
    );
    for (let attempt = 1; attempt <= 15; attempt += 1) {
      expect(
        consumeLoginRateLimit(headers, `other-${attempt}@example.com`).allowed,
      ).toBe(true);
    }
    expect(consumeLoginRateLimit(headers, "blocked@example.com").allowed).toBe(
      false,
    );
  });

  it("expires login counters and limits registrations per IP", async () => {
    const { consumeLoginRateLimit, consumeRegistrationRateLimit } =
      await loadRateLimiter();
    const loginHeaders = headersFor("198.51.100.40");

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      consumeLoginRateLimit(loginHeaders, "user@example.com");
    }
    expect(
      consumeLoginRateLimit(loginHeaders, "user@example.com").allowed,
    ).toBe(false);
    vi.advanceTimersByTime(15 * 60 * 1000 + 1);
    expect(
      consumeLoginRateLimit(loginHeaders, "user@example.com").allowed,
    ).toBe(true);

    const registrationHeaders = headersFor("198.51.100.50");
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      expect(
        consumeRegistrationRateLimit(
          registrationHeaders,
          `register-${attempt}@example.com`,
        ).allowed,
      ).toBe(true);
    }
    expect(
      consumeRegistrationRateLimit(registrationHeaders, "blocked@example.com")
        .allowed,
    ).toBe(false);
  });

  it("keeps the in-memory store bounded without failing closed", async () => {
    const { consumeLoginRateLimit } = await loadRateLimiter();

    for (let index = 1; index <= 5_100; index += 1) {
      expect(
        consumeLoginRateLimit(
          headersFor(`2001:db8::${index.toString(16)}`),
          `capacity-${index}@example.com`,
        ).allowed,
      ).toBe(true);
    }

    const store = (globalThis as unknown as TestRateLimitGlobal)
      .authRateLimitStore;
    expect(store?.size).toBe(10_000);
  });
});
