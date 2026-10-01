import type { Metadata } from "next";
import Link from "next/link";
import { Coffee, FolderOpen, MessageSquareText, Users } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { LinkButton } from "@/components/admin/link-button";
import { Button } from "@/components/ui/button";
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
  title: "Panel de administración",
  description: "Resumen y acceso a la gestión de la carta.",
};

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const prisma = await getPrisma();
  const [
    productCount,
    availableProductCount,
    categoryCount,
    userCount,
    commentCount,
  ] = await prisma.$transaction([
    prisma.product.count(),
    prisma.product.count({ where: { available: true } }),
    prisma.category.count(),
    prisma.user.count(),
    prisma.comment.count(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Zona privada
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Panel de administración
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Sesión iniciada como {user.name ?? user.email}.
        </p>
      </div>

      <section
        aria-label="Resumen de la carta"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <CardDescription>
              {availableProductCount} disponibles de {productCount} en total
            </CardDescription>
            <CardAction>
              <Coffee className="size-5 text-muted-foreground" aria-hidden />
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{productCount}</p>
            <Link
              href="/admin/productos"
              className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Gestionar productos
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
            <CardDescription>Secciones de la carta</CardDescription>
            <CardAction>
              <FolderOpen
                className="size-5 text-muted-foreground"
                aria-hidden
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{categoryCount}</p>
            <Link
              href="/admin/categorias"
              className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Gestionar categorías
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comentarios</CardTitle>
            <CardDescription>Publicados por clientes</CardDescription>
            <CardAction>
              <MessageSquareText
                className="size-5 text-muted-foreground"
                aria-hidden
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{commentCount}</p>
            <Link
              href="/admin/comentarios"
              className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Moderar comentarios
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Cuentas registradas</CardDescription>
            <CardAction>
              <Users className="size-5 text-muted-foreground" aria-hidden />
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{userCount}</p>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <LinkButton href="/menu" variant="outline" className="min-h-11">
          Ver carta pública
        </LinkButton>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" className="h-11">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
