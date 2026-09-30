import type { MetadataRoute } from "next";

import { getPrisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prisma = await getPrisma();
  const products = await prisma.product.findMany({
    where: { available: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const baseLastModified = new Date();

  return [
    { url: `${siteUrl}/`, lastModified: baseLastModified },
    { url: `${siteUrl}/carta`, lastModified: baseLastModified },
    ...products.map((product) => ({
      url: `${siteUrl}/carta/${product.slug}`,
      lastModified: product.updatedAt,
    })),
  ];
}
