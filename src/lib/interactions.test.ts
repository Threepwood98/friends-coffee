import { randomUUID } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ProductCommentForbiddenError,
  createProductComment,
  deleteProductComment,
  getProductComments,
  getCommentProductSlug,
} from "./comments";
import { toggleCommentLike } from "./likes";
import { consumeCommentRateLimit, consumeLikeRateLimit } from "./rate-limit";
import { getProductRatingSummary, upsertProductRating } from "./ratings";
import {
  commentTextSchema,
  ratingValueSchema,
} from "./validators/interactions";

const MIGRATIONS_DIR = path.join(process.cwd(), "prisma", "migrations");

let prisma: PrismaClient;
let tempDir: string;

async function createDatabase() {
  tempDir = mkdtempSync(path.join(os.tmpdir(), "friends-coffee-test-"));
  const databasePath = path.join(tempDir, "test.db").replaceAll("\\", "/");
  const prisma = new PrismaClient({ datasourceUrl: `file:${databasePath}` });

  const migrationFiles = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => path.join(MIGRATIONS_DIR, entry.name, "migration.sql"));

  for (const migrationFile of migrationFiles) {
    const sql = readFileSync(migrationFile, "utf8");
    const statements = sql
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }
  }

  return prisma;
}

async function seedUser(
  overrides: Partial<{ email: string; name: string; role: string }> = {},
) {
  return prisma.user.create({
    data: {
      email: overrides.email ?? `${randomUUID()}@test.local`,
      name: overrides.name ?? "Usuario de prueba",
      role: overrides.role ?? "USER",
    },
  });
}

async function seedProduct() {
  const category = await prisma.category.create({
    data: {
      name: `Categoría ${randomUUID()}`,
      slug: `categoria-${randomUUID()}`,
    },
  });

  return prisma.product.create({
    data: {
      slug: `producto-${randomUUID()}`,
      name: "Producto de prueba",
      description: "Descripción de prueba.",
      price: 350,
      categoryId: category.id,
    },
  });
}

beforeAll(async () => {
  prisma = await createDatabase();
});

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }

  if (tempDir) {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Windows may keep the SQLite handles open briefly.
    }
  }
});

describe("ratingValueSchema", () => {
  it("accepts integers from 1 to 5", () => {
    for (const value of [1, 2, 3, 4, 5]) {
      expect(ratingValueSchema.safeParse(value).success).toBe(true);
    }
  });

  it("rejects out-of-range, non-integer and non-number values", () => {
    for (const value of [0, 6, 1.5, "3", null, undefined, NaN]) {
      expect(ratingValueSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("commentTextSchema", () => {
  it("rejects empty and whitespace-only comments", () => {
    expect(commentTextSchema.safeParse("").success).toBe(false);
    expect(commentTextSchema.safeParse("   ").success).toBe(false);
  });

  it("rejects comments longer than 500 characters", () => {
    expect(commentTextSchema.safeParse("a".repeat(501)).success).toBe(false);
    expect(commentTextSchema.safeParse("a".repeat(500)).success).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    const result = commentTextSchema.safeParse("  Hola, buen café.  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("Hola, buen café.");
    }
  });
});

describe("product ratings", () => {
  it("upserts a rating per user and aggregates the summary", async () => {
    const product = await seedProduct();
    const userA = await seedUser();
    const userB = await seedUser();

    await upsertProductRating(prisma, {
      userId: userA.id,
      productId: product.id,
      value: 5,
    });

    await upsertProductRating(prisma, {
      userId: userA.id,
      productId: product.id,
      value: 3,
    });

    await upsertProductRating(prisma, {
      userId: userB.id,
      productId: product.id,
      value: 4,
    });

    const summary = await getProductRatingSummary(prisma, product.id);

    expect(summary.count).toBe(2);
    expect(summary.average).toBe(3.5);
  });
});

describe("product comments", () => {
  it("returns ordered comments by likes and then by recency", async () => {
    const product = await seedProduct();
    const user = await seedUser();

    const older = await createProductComment(prisma, {
      userId: user.id,
      productId: product.id,
      text: "Comentario con más likes.",
    });
    await prisma.comment.update({
      where: { id: older.id },
      data: { likeCount: 3 },
    });

    const newest = await createProductComment(prisma, {
      userId: user.id,
      productId: product.id,
      text: "Comentario reciente sin likes.",
    });
    await prisma.comment.update({
      where: { id: newest.id },
      data: { createdAt: new Date() },
    });

    const comments = await getProductComments(prisma, product.id);

    expect(comments.map((comment) => comment.id)).toEqual([
      older.id,
      newest.id,
    ]);
    expect(comments[0]).toMatchObject({
      text: "Comentario con más likes.",
      likeCount: 3,
      authorName: "Usuario de prueba",
    });
  });

  it("allows the author to delete their own comment", async () => {
    const product = await seedProduct();
    const user = await seedUser();
    const comment = await createProductComment(prisma, {
      userId: user.id,
      productId: product.id,
      text: "Comentario mío.",
    });

    const deleted = await deleteProductComment(prisma, {
      commentId: comment.id,
      actorId: user.id,
      actorRole: "USER",
    });

    expect(deleted).toBe(true);
    expect(await getProductComments(prisma, product.id)).toHaveLength(0);
  });

  it("forbids a regular user from deleting someone else's comment", async () => {
    const product = await seedProduct();
    const author = await seedUser();
    const stranger = await seedUser();
    const comment = await createProductComment(prisma, {
      userId: author.id,
      productId: product.id,
      text: "Comentario ajeno.",
    });

    await expect(
      deleteProductComment(prisma, {
        commentId: comment.id,
        actorId: stranger.id,
        actorRole: "USER",
      }),
    ).rejects.toThrow(ProductCommentForbiddenError);
  });

  it("lets an admin delete any comment", async () => {
    const product = await seedProduct();
    const author = await seedUser();
    const admin = await seedUser({ role: "ADMIN" });
    const comment = await createProductComment(prisma, {
      userId: author.id,
      productId: product.id,
      text: "Comentario que modera el admin.",
    });

    const deleted = await deleteProductComment(prisma, {
      commentId: comment.id,
      actorId: admin.id,
      actorRole: "ADMIN",
    });

    expect(deleted).toBe(true);
  });

  it("returns the product slug for a comment", async () => {
    const product = await seedProduct();
    const user = await seedUser();
    const comment = await createProductComment(prisma, {
      userId: user.id,
      productId: product.id,
      text: "¿Dónde estaba este café?",
    });

    expect(await getCommentProductSlug(prisma, comment.id)).toBe(product.slug);
    expect(await getCommentProductSlug(prisma, "inexistente")).toBeNull();
  });
});

describe("comment likes", () => {
  it("toggles likes and keeps the counter in sync", async () => {
    const product = await seedProduct();
    const commenter = await seedUser();
    const userA = await seedUser();
    const userB = await seedUser();
    const comment = await createProductComment(prisma, {
      userId: commenter.id,
      productId: product.id,
      text: "Candidato a gustar.",
    });

    expect(
      (
        await toggleCommentLike(prisma, {
          userId: userA.id,
          commentId: comment.id,
        })
      ).liked,
    ).toBe(true);
    expect(
      (
        await toggleCommentLike(prisma, {
          userId: userB.id,
          commentId: comment.id,
        })
      ).liked,
    ).toBe(true);
    expect(
      (
        await toggleCommentLike(prisma, {
          userId: userA.id,
          commentId: comment.id,
        })
      ).liked,
    ).toBe(false);

    const refreshed = await prisma.comment.findUniqueOrThrow({
      where: { id: comment.id },
    });

    expect(refreshed.likeCount).toBe(1);
  });

  it("never decrements the counter below zero", async () => {
    const product = await seedProduct();
    const commenter = await seedUser();
    const user = await seedUser();
    const comment = await createProductComment(prisma, {
      userId: commenter.id,
      productId: product.id,
      text: "Contador protegido.",
    });

    await prisma.comment.update({
      where: { id: comment.id },
      data: { likeCount: 0 },
    });

    await toggleCommentLike(prisma, { userId: user.id, commentId: comment.id });

    await prisma.comment.update({
      where: { id: comment.id },
      data: { likeCount: 0 },
    });

    await toggleCommentLike(prisma, { userId: user.id, commentId: comment.id });

    const refreshed = await prisma.comment.findUniqueOrThrow({
      where: { id: comment.id },
    });

    expect(refreshed.likeCount).toBe(0);
  });
});

function fakeClientHeaders(ip: string) {
  return {
    get(name: string) {
      return name === "cf-connecting-ip" ? ip : null;
    },
  };
}

describe("interaction rate limits", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("limits comments to 20 per IP in the window", () => {
    const headers = fakeClientHeaders("10.0.0.1");

    for (let index = 0; index < 20; index += 1) {
      expect(
        consumeCommentRateLimit(headers, `a${index}@test.local`).allowed,
      ).toBe(true);
    }

    expect(consumeCommentRateLimit(headers, "a-extra@test.local").allowed).toBe(
      false,
    );
  });

  it("limits comments to 10 per identity in the window", () => {
    const headers = fakeClientHeaders("10.0.0.5");

    for (let index = 0; index < 10; index += 1) {
      expect(
        consumeCommentRateLimit(headers, "shared@test.local").allowed,
      ).toBe(true);
    }

    expect(consumeCommentRateLimit(headers, "shared@test.local").allowed).toBe(
      false,
    );
  });

  it("limits likes to 40 per IP in the window", () => {
    const headers = fakeClientHeaders("10.0.0.2");

    for (let index = 0; index < 40; index += 1) {
      expect(
        consumeLikeRateLimit(headers, `b${index}@test.local`).allowed,
      ).toBe(true);
    }

    expect(consumeLikeRateLimit(headers, "b-extra@test.local").allowed).toBe(
      false,
    );
  });

  it("limits likes to 20 per identity in the window", () => {
    const headers = fakeClientHeaders("10.0.0.6");

    for (let index = 0; index < 20; index += 1) {
      expect(consumeLikeRateLimit(headers, "liker@test.local").allowed).toBe(
        true,
      );
    }

    expect(consumeLikeRateLimit(headers, "liker@test.local").allowed).toBe(
      false,
    );
  });

  it("resets comment and like limits after the window elapses", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    const commentHeaders = fakeClientHeaders("10.0.0.3");
    const likeHeaders = fakeClientHeaders("10.0.0.4");

    for (let index = 0; index < 10; index += 1) {
      consumeCommentRateLimit(commentHeaders, "c@test.local");
    }
    for (let index = 0; index < 20; index += 1) {
      consumeLikeRateLimit(likeHeaders, "c@test.local");
    }

    expect(
      consumeCommentRateLimit(commentHeaders, "c@test.local").allowed,
    ).toBe(false);
    expect(consumeLikeRateLimit(likeHeaders, "c@test.local").allowed).toBe(
      false,
    );

    vi.advanceTimersByTime(16 * 60 * 1000);

    expect(
      consumeCommentRateLimit(commentHeaders, "c@test.local").allowed,
    ).toBe(true);
    expect(consumeLikeRateLimit(likeHeaders, "c@test.local").allowed).toBe(
      true,
    );
  });
});
