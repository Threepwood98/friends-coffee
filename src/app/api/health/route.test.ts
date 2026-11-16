import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPrisma: vi.fn(),
  queryRaw: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: mocks.getPrisma,
}));

import { GET } from "./route";

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPrisma.mockResolvedValue({
      $queryRaw: mocks.queryRaw,
    });
  });

  it("returns 200 when SQLite is ready", async () => {
    mocks.queryRaw.mockResolvedValue([{ 1: 1 }]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  it("returns a sanitized 503 when SQLite is unavailable", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mocks.queryRaw.mockRejectedValue(new Error("database path leaked"));

    const response = await GET();

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      status: "unavailable",
    });
    expect(consoleError).toHaveBeenCalledOnce();

    consoleError.mockRestore();
  });
});
