import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/category-form";
import { LinkButton } from "@/components/admin/link-button";
import { getPrisma } from "@/lib/prisma";

interface AdminEditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Editar categoría",
  description: "Modifica una categoría de la carta.",
};

export default async function AdminEditCategoryPage({
  params,
}: AdminEditCategoryPageProps) {
  const { id } = await params;
  const prisma = await getPrisma();
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, slug: true, name: true, position: true },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Carta · Categorías
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Editar «{category.name}»
        </h1>
      </div>

      <CategoryForm category={category} />

      <div>
        <LinkButton href="/admin/categorias" variant="ghost">
          Volver a categorías
        </LinkButton>
      </div>
    </div>
  );
}
