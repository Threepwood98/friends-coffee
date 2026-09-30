import { cache } from "react";

import { getPrisma } from "@/lib/prisma";

const productSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  priceCents: true,
  imageUrl: true,
  available: true,
} as const;

const categorySlugSelect = {
  name: true,
  slug: true,
} as const;

export interface MenuProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  available: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  position: number;
  products: MenuProduct[];
}

export interface MenuProductDetail extends MenuProduct {
  category: { name: string; slug: string };
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  const prisma = await getPrisma();

  return prisma.category.findMany({
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
  });
}

export async function getFeaturedProducts(
  limit: number,
): Promise<MenuProductDetail[]> {
  const prisma = await getPrisma();

  return prisma.product.findMany({
    where: { available: true },
    orderBy: [{ category: { position: "asc" } }, { name: "asc" }],
    take: limit,
    select: { ...productSelect, category: { select: categorySlugSelect } },
  });
}

export async function getProductSlugs(): Promise<string[]> {
  const prisma = await getPrisma();
  const products = await prisma.product.findMany({ select: { slug: true } });

  return products.map((product) => product.slug);
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
