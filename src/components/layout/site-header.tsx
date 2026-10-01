"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRoundIcon } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 bg-primary">
      {/* <div
        aria-hidden
        className="h-1 bg-linear-to-r from-primary via-peephole to-accent"
      /> */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
        <Link
          href="/menu"
          aria-label="Friends Coffee — Menú"
          className="flex flex-col min-h-11 shrink-0 items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, no optimization needed */}
          <img
            src="/images/friends_logo.svg"
            alt="Friends Coffee"
            className="h-6 w-auto sm:h-8"
          />
          <span className="font-heading text-black text-lg lowercase leading-none tracking-[0.35em] sm:tracking-[0.45em] bg-peephole px-2">
            coffee
          </span>
        </Link>

        <Link
          href="/cuenta"
          aria-label="Mi cuenta"
          aria-current={pathname.startsWith("/cuenta") ? "page" : undefined}
          className="inline-flex size-11 items-center justify-center rounded-full border-4 border-peephole bg-cream text-coffee transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <UserRoundIcon />
        </Link>
      </div>
    </header>
  );
}
