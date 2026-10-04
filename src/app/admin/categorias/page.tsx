import type { Metadata } from "next";
import { FolderOpen, Pencil } from "lucide-react";

import { deleteCategoryAction } from "@/actions/categories";
import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { LinkButton } from "@/components/admin/link-button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Gestión de las secciones de la carta.",
};

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const prisma = await getPrisma();
  const categories = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Carta
        </p>
        <h1 className="text-balance break-words text-2xl font-semibold tracking-tight sm:text-3xl">
          Categorías
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Organiza la carta en secciones. Los productos se agrupan por
          categoría.
        </p>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
        <Card className="min-w-0 lg:self-start">
          <CardHeader>
            <CardTitle>Nueva categoría</CardTitle>
            <CardDescription>Se añadirá al final de la carta.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryForm />
          </CardContent>
        </Card>

        <section
          aria-label="Categorías existentes"
          className="flex min-w-0 flex-col gap-4"
        >
          {categories.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No hay categorías</CardTitle>
                <CardDescription>
                  Crea la primera con el formulario.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <ul className="flex min-w-0 flex-col gap-4">
              {categories.map((category) => (
                <li key={category.id} className="min-w-0">
                  <Card>
                    <CardHeader className="min-w-0">
                      <CardTitle className="break-words">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="break-all">
                        /menu/{category.slug} · posición {category.position}
                      </CardDescription>
                      <CardAction>
                        <FolderOpen
                          className="size-5 text-muted-foreground"
                          aria-hidden
                        />
                      </CardAction>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-start gap-2">
                      <span className="inline-flex items-center rounded-lg bg-muted px-2.5 py-1 text-sm font-medium text-muted-foreground">
                        {category._count.products}{" "}
                        {category._count.products === 1
                          ? "producto"
                          : "productos"}
                      </span>
                      <LinkButton
                        href={`/admin/categorias/${category.id}/editar`}
                        variant="outline"
                        aria-label={`Editar ${category.name}`}
                      >
                        <Pencil data-icon="inline-start" aria-hidden />
                        Editar
                      </LinkButton>
                      <ConfirmDeleteButton
                        title="Borrar"
                        itemLabel={category.name}
                        onConfirm={() => deleteCategoryAction(category.id)}
                      />
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
