import type { Metadata } from "next";

import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Administración",
  description: "Panel privado de gestión de la carta.",
};

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Zona privada
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Panel de administración
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Has accedido como {user.name ?? user.email}. La gestión de productos,
          categorías y comentarios se añadirá en su fase correspondiente.
        </p>
      </div>

      <form action={logoutAction}>
        <Button type="submit" variant="outline" className="h-11">
          Cerrar sesión
        </Button>
      </form>
    </main>
  );
}
