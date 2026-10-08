import Link from "next/link";
import { ArrowLeft, Coffee } from "lucide-react";

import { CouchScene } from "@/components/layout/couch-scene";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-cream pt-[max(2rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] [background-image:radial-gradient(circle_at_14%_10%,color-mix(in_oklch,var(--peephole)_22%,transparent)_0_2px,transparent_3px),radial-gradient(circle_at_86%_28%,color-mix(in_oklch,var(--door)_12%,transparent)_0_2px,transparent_3px)] [background-size:42px_42px,58px_58px] sm:pt-[max(2.5rem,env(safe-area-inset-top))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] sm:pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:pl-[max(1.5rem,env(safe-area-inset-left))]">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-coffee/10 bg-card shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative flex min-h-60 items-end overflow-hidden bg-primary p-5 sm:min-h-72 sm:p-8 lg:min-h-[38rem]">
          <div
            aria-hidden
            className="absolute -top-16 -left-16 size-56 rounded-full border-[22px] border-peephole"
          />
          <div className="relative w-full rounded-[2rem] bg-card p-3 shadow-2xl sm:p-5">
            <CouchScene />
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-center gap-5 p-6 text-center sm:gap-6 sm:p-10 lg:p-14 lg:text-left">
          <div
            aria-hidden
            className="flex justify-center gap-1 text-accent lg:justify-start"
          >
            {[1, 2, 3].map((value) => (
              <Coffee key={value} className="size-7 fill-current" />
            ))}
          </div>
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Error 404
          </p>
          <h1 className="text-balance break-words font-heading text-4xl leading-tight font-normal tracking-tight text-coffee sm:text-5xl lg:text-6xl">
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
