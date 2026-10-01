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
import { formatPrice } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Productos",
  description: "Gestión de los productos de la carta.",
};

export default async function AdminProductsPage() {
  const prisma = await getPrisma();
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      available: true,
      priceCents: true,
      imageUrl: true,
      category: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            Carta
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Productos</h1>
          <p className="max-w-2xl text-muted-foreground">
            {products.length}{" "}
            {products.length === 1
              ? "producto en la carta"
              : "productos en la carta"}
            .
          </p>
        </div>
        <LinkButton href="/admin/productos/nuevo">
          <Plus className="size-4" aria-hidden />
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
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <Card key={product.id}>
              {product.imageUrl ? (
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <Image
                    src={product.imageUrl}
                    alt={`Fotografía de ${product.name}`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.category.name}</CardDescription>
                <CardAction>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={product.available ? "default" : "secondary"}
                    >
                      {product.available ? "Disponible" : "Oculto"}
                    </Badge>
                    <span className="font-heading text-lg font-medium">
                      {formatPrice(product.priceCents)}
                    </span>
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <LinkButton
                  href={`/admin/productos/${product.id}/editar`}
                  variant="outline"
                >
                  Editar
                </LinkButton>
                <LinkButton href={`/menu/${product.slug}`} variant="ghost">
                  Ver en carta
                  <ArrowRight className="size-4" aria-hidden />
                </LinkButton>
                <ConfirmDeleteButton
                  title="Borrar"
                  onConfirm={() => deleteProductAction(product.id)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
