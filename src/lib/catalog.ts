import type { PrismaClient } from "@prisma/client";
import { cache } from "react";

import { getPrisma } from "@/lib/prisma";

const productSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  available: true,
} as const;

const categorySlugSelect = {
  name: true,
  slug: true,
} as const;

interface ProductData {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  available: boolean;
}

export interface MenuProduct extends ProductData {
  commentCount: number;
  ratingAverage: number | null;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  position: number;
  products: MenuProduct[];
}

export interface MenuProductDetail extends ProductData {
  category: { name: string; slug: string };
}

export async function getMenuCategories(
  db?: PrismaClient,
): Promise<MenuCategory[]> {
  const prisma = db ?? (await getPrisma());

  const [categories, ratingAggregates, commentAggregates] = await Promise.all([
    prisma.category.findMany({
      orderBy: { position: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        position: true,
        products: {
          orderBy: { name: "asc" },
          select: productSelect,
        },
      },
    }),
    prisma.rating.groupBy({
      by: ["productId"],
      _avg: { value: true },
    }),
    prisma.comment.groupBy({
      by: ["productId"],
      _count: { _all: true },
    }),
  ]);

  const ratingsByProduct = new Map(
    ratingAggregates.map((rating) => [rating.productId, rating._avg.value]),
  );
  const commentsByProduct = new Map(
    commentAggregates.map((comment) => [
      comment.productId,
      comment._count._all,
    ]),
  );

  return categories.map((category) => ({
    ...category,
    products: category.products.map((product) => ({
      ...product,
      commentCount: commentsByProduct.get(product.id) ?? 0,
      ratingAverage: ratingsByProduct.get(product.id) ?? null,
    })),
  }));
}

export const getProductBySlug = cache(
  async (slug: string): Promise<MenuProductDetail | null> => {
    const prisma = await getPrisma();

    return prisma.product.findUnique({
      where: { slug },
      select: { ...productSelect, category: { select: categorySlugSelect } },
    });
  },
);

export async function getProductRedirectSlug(
  slug: string,
): Promise<string | null> {
  const prisma = await getPrisma();
  const redirect = await prisma.productSlugRedirect.findUnique({
    where: { slug },
    select: { product: { select: { slug: true } } },
  });

  return redirect?.product.slug ?? null;
}
