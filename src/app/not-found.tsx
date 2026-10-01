import Link from "next/link";
import { ArrowLeft, Coffee } from "lucide-react";

import { CouchScene } from "@/components/layout/couch-scene";

export default function NotFound() {
  return (
    <main className="friends-canvas flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <div className="friends-surface grid w-full max-w-5xl overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative flex min-h-72 items-end overflow-hidden bg-primary p-5 sm:p-8 lg:min-h-[38rem]">
          <div
            aria-hidden
            className="absolute -top-16 -left-16 size-56 rounded-full border-[22px] border-peephole"
          />
          <div className="relative w-full rounded-[2rem] bg-card p-3 shadow-2xl sm:p-5">
            <CouchScene />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 p-7 text-center sm:p-10 lg:p-14 lg:text-left">
          <div
            aria-hidden
            className="flex justify-center gap-1 text-accent lg:justify-start"
          >
            {[1, 2, 3].map((value) => (
              <Coffee key={value} className="size-7 fill-current" />
            ))}
          </div>
          <p className="friends-kicker text-xs font-semibold text-primary">
            Error 404
          </p>
          <h1 className="font-heading text-5xl leading-none font-normal tracking-tight text-coffee sm:text-7xl">
            Esta mesa no existe
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            La página que buscas no está en la carta. Quizá se quedó en el sofá
            o tras la puerta morada.
          </p>
          <div className="flex justify-center lg:justify-start">
            <Link
              href="/menu"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Volver al menú
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
