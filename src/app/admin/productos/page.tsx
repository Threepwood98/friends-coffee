import type { Metadata } from "next";
import Image from "next/image";
import { Plus, ArrowRight } from "lucide-react";

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
import { deleteProductAction } from "@/actions/products";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Productos",
  description: "Gestión de los productos de la carta.",
};

export default async function AdminProductsPage() {
  await requireAdmin();
  const prisma = await getPrisma();
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      available: true,
      price: true,
      imageUrl: true,
      category: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4 sm:items-end">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            Carta
          </p>
          <h1 className="text-balance break-words text-2xl font-semibold tracking-tight sm:text-3xl">
            Productos
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            {products.length}{" "}
            {products.length === 1
              ? "producto en la carta"
              : "productos en la carta"}
            .
          </p>
        </div>
        <LinkButton href="/admin/productos/nuevo" className="w-full sm:w-auto">
          <Plus data-icon="inline-start" aria-hidden />
          Nuevo producto
        </LinkButton>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aún no hay productos</CardTitle>
            <CardDescription>
              Crea el primer producto para que aparezca en la carta.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <li key={product.id} className="min-w-0">
              <Card className={product.imageUrl ? "h-full pt-0" : "h-full"}>
                {product.imageUrl ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={product.imageUrl}
                      alt={`Fotografía de ${product.name}`}
                      fill
                      sizes="(min-width: 1280px) 22rem, (min-width: 768px) calc(50vw - 2.5rem), calc(100vw - 2rem)"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <CardHeader className="min-w-0">
                  <CardTitle className="min-w-0 break-words">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="break-words">
                    {product.category.name}
                  </CardDescription>
                  <CardAction className="min-w-0 max-w-[45%]">
                    <div className="flex min-w-0 flex-col items-end gap-2">
                      <Badge
                        variant={product.available ? "default" : "secondary"}
                      >
                        {product.available ? "Disponible" : "Oculto"}
                      </Badge>
                      <span className="max-w-full text-right font-heading text-lg font-medium break-all">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </CardAction>
                </CardHeader>
                <CardContent className="mt-auto flex flex-wrap items-start gap-2">
                  <LinkButton
                    href={`/admin/productos/${product.id}/editar`}
                    variant="outline"
                    aria-label={`Editar ${product.name}`}
                  >
                    Editar
                  </LinkButton>
                  <LinkButton
                    href={`/menu/${product.slug}`}
                    variant="ghost"
                    aria-label={`Ver ${product.name} en la carta`}
                  >
                    Ver en carta
                    <ArrowRight data-icon="inline-end" aria-hidden />
                  </LinkButton>
                  <ConfirmDeleteButton
                    title="Borrar"
                    itemLabel={product.name}
                    onConfirm={() => deleteProductAction(product.id)}
                  />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
