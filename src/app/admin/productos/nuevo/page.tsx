import type { Metadata } from "next";

import { LinkButton } from "@/components/admin/link-button";
import {
  ProductForm,
  type ProductFormOption,
} from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Nuevo producto",
  description: "Añade un producto a la carta.",
};

export default async function AdminNewProductPage() {
  await requireAdmin();
  const prisma = await getPrisma();
  const categories = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  if (categories.length === 0) {
    return (
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-balance break-words text-2xl font-semibold tracking-tight sm:text-3xl">
            Nuevo producto
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            No hay categorías todavía.
          </p>
        </div>
        <div>
          <LinkButton href="/admin/categorias" className="w-full sm:w-auto">
            Crear una categoría
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Carta · Productos
        </p>
        <h1 className="text-balance break-words text-2xl font-semibold tracking-tight sm:text-3xl">
          Nuevo producto
        </h1>
      </div>

      <ProductForm categories={categories as ProductFormOption[]} />
    </div>
  );
}
