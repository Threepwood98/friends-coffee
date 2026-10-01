import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LinkButton } from "@/components/admin/link-button";
import {
  ProductForm,
  type ProductFormOption,
  type ProductFormProduct,
} from "@/components/admin/product-form";
import { getPrisma } from "@/lib/prisma";

interface AdminEditProductPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Editar producto",
  description: "Modifica un producto de la carta.",
};

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  const { id } = await params;
  const prisma = await getPrisma();
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        price: true,
        available: true,
        imageUrl: true,
        categoryId: true,
      },
    }),
    prisma.category.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Carta · Productos
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Editar «{product.name}»
        </h1>
      </div>

      <ProductForm
        categories={categories as ProductFormOption[]}
        product={product as ProductFormProduct}
      />

      <div>
        <LinkButton href="/admin/productos" variant="ghost">
          Volver a productos
        </LinkButton>
      </div>
    </div>
  );
}
