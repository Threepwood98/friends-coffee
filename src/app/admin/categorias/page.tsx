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
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Gestión de las secciones de la carta.",
};

export default async function AdminCategoriesPage() {
  const prisma = await getPrisma();
  const categories = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Carta
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Categorías</h1>
        <p className="max-w-2xl text-muted-foreground">
          Organiza la carta en secciones. Los productos se agrupan por
          categoría.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section
          aria-label="Categorías existentes"
          className="flex flex-col gap-4"
        >
          {categories.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No hay categorías</CardTitle>
                <CardDescription>
                  Crea la primera con el formulario de la derecha.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <ul className="flex flex-col gap-4">
              {categories.map((category) => (
                <li key={category.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>
                        /menu/{category.slug} · posición {category.position}
                      </CardDescription>
                      <CardAction>
                        <FolderOpen
                          className="size-5 text-muted-foreground"
                          aria-hidden
                        />
                      </CardAction>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-lg bg-muted px-2.5 py-1 text-sm font-medium text-muted-foreground">
                        {category._count.products}{" "}
                        {category._count.products === 1
                          ? "producto"
                          : "productos"}
                      </span>
                      <LinkButton
                        href={`/admin/categorias/${category.id}/editar`}
                        variant="outline"
                      >
                        <Pencil className="size-4" aria-hidden />
                        Editar
                      </LinkButton>
                      <ConfirmDeleteButton
                        title="Borrar"
                        onConfirm={() => deleteCategoryAction(category.id)}
                      />
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Card className="lg:self-start">
          <CardHeader>
            <CardTitle>Nueva categoría</CardTitle>
            <CardDescription>Se añadirá al final de la carta.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
