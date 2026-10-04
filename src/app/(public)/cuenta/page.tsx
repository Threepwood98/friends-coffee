import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, LogOut, Mail, ShieldCheck } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { FriendsWordmark } from "@/components/brand/friends-wordmark";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Tu cuenta",
  description: "Consulta tus datos de acceso a Friends Coffee.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const user = await requireUser("/cuenta");
  const initial = (user.name?.trim()[0] ?? user.email[0] ?? "F").toUpperCase();

  return (
    <div className="site-container flex max-w-5xl flex-col gap-6 py-6 sm:gap-8 sm:py-10 lg:py-14">
      <header className="flex animate-fade-up flex-col gap-3">
        <p className="friends-kicker text-xs font-semibold text-primary">
          Tu rincón reservado
        </p>
        <h1 className="text-balance break-words font-heading text-4xl font-normal tracking-tight text-coffee sm:text-5xl lg:text-6xl">
          Tu cuenta
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Aquí tienes los datos con los que participas en la sobremesa.
        </p>
      </header>

      <section
        aria-label="Datos de la cuenta"
        className="friends-surface grid overflow-hidden md:grid-cols-[0.82fr_1.18fr]"
      >
        <div className="relative flex min-h-60 flex-col justify-between overflow-hidden bg-primary p-5 text-primary-foreground sm:min-h-72 sm:p-9">
          <div
            aria-hidden
            className="absolute -top-16 -right-12 size-48 rounded-full border-[18px] border-peephole/90"
          />
          <div
            aria-hidden
            className="relative flex size-20 items-center justify-center rounded-[1.75rem] border-4 border-peephole bg-card font-heading text-5xl text-primary"
          >
            {initial}
          </div>
          <div className="relative flex flex-col gap-2">
            <p className="font-heading text-3xl font-normal">
              <FriendsWordmark tone="inherit" />
            </p>
            <p className="max-w-xs text-sm leading-6 text-primary-foreground/80">
              Cafés, comentarios y valoraciones desde tu mesa favorita.
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6 p-5 sm:gap-7 sm:p-9">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">Nombre</p>
            <p className="break-words text-xl font-semibold text-coffee">
              {user.name ?? "Amigo de Friends Coffee"}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-secondary/35 p-4">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card text-primary">
              <Mail className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Correo electrónico
              </p>
              <p className="break-all font-medium text-coffee">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-accent/10 p-4">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card text-accent">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Rol</p>
              <p className="font-medium text-coffee">
                {user.role === "ADMIN" ? "Administrador" : "Cliente"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-coffee/10 pt-6 sm:flex-row">
            {user.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <LayoutDashboard className="size-4" aria-hidden />
                Ir al panel
              </Link>
            ) : null}

            <form action={logoutAction} className="flex-1">
              <Button
                type="submit"
                variant="outline"
                className="w-full rounded-full"
              >
                <LogOut data-icon="inline-start" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
