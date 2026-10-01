import type { ReactNode } from "react";
import Link from "next/link";
import { Coffee, Sparkles } from "lucide-react";

import { FriendsWordmark } from "@/components/brand/friends-wordmark";
import { CouchScene } from "@/components/layout/couch-scene";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="friends-canvas relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:py-12">
      <svg
        aria-hidden
        viewBox="0 0 900 760"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
      >
        <path
          d="M-40 130C190 20 210 330 470 240S780 110 950 310M-60 690C180 510 270 790 520 640S790 480 970 670"
          fill="none"
          stroke="var(--sofa)"
          strokeWidth="5"
          strokeDasharray="12 17"
          strokeLinecap="round"
        />
      </svg>

      <div className="friends-surface relative z-10 grid w-full max-w-6xl overflow-hidden lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-primary p-6 text-primary-foreground sm:p-8 lg:min-h-[44rem] lg:p-10">
          <div
            aria-hidden
            className="absolute -top-20 -left-20 size-64 rounded-full border-[24px] border-peephole/90"
          />
          <div
            aria-hidden
            className="absolute -right-16 -bottom-16 size-56 rounded-full bg-accent/45 blur-2xl"
          />

          <Link
            href="/"
            className="relative inline-flex w-fit min-h-11 items-center gap-2.5 rounded-xl font-heading text-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-peephole"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-peephole text-primary">
              <Coffee className="size-5" aria-hidden />
            </span>
            <FriendsWordmark tone="inherit" />
          </Link>

          <div className="relative mx-auto flex w-full max-w-md items-end justify-center rounded-[2rem] bg-card p-3 text-coffee shadow-2xl sm:p-5 lg:my-auto">
            <CouchScene />
            <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-2 text-xs font-semibold shadow sm:right-5 sm:bottom-5">
              <Sparkles className="size-4 text-accent" aria-hidden />
              Tu mesa te espera
            </span>
          </div>

          <p className="relative hidden max-w-sm text-sm leading-6 text-primary-foreground/75 lg:block">
            Entra, elige tu café favorito y quédate para la conversación.
          </p>
        </section>

        <section className="flex flex-col justify-center gap-7 bg-card p-6 sm:p-9 lg:p-14">
          <header className="flex flex-col gap-3">
            <p className="friends-kicker text-xs font-semibold text-primary">
              {eyebrow}
            </p>
            <h1 className="font-heading text-4xl leading-none font-normal tracking-tight text-coffee sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </header>

          <div className="flex flex-col gap-5">{children}</div>

          <footer className="border-t border-coffee/10 pt-6 text-center text-sm text-muted-foreground">
            {footer}
          </footer>
        </section>
      </div>
    </main>
  );
}
