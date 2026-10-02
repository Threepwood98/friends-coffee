"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRoundIcon } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 bg-primary">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
        <Link
          href="/menu"
          aria-label="Friends Coffee — Menú"
          className="flex min-h-11 shrink-0 flex-col items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-peephole"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, no optimization needed */}
          <img
            src="/images/Friends_logo.svg"
            alt=""
            width={1186}
            height={196}
            className="h-6 w-auto sm:h-8"
          />
          <span className="bg-peephole px-2 font-heading text-lg leading-none tracking-[0.35em] text-black lowercase sm:tracking-[0.45em]">
            coffee
          </span>
        </Link>

        <nav aria-label="Principal">
          <Link
            href="/cuenta"
            aria-label="Mi cuenta"
            aria-current={pathname.startsWith("/cuenta") ? "page" : undefined}
            className="inline-flex size-11 items-center justify-center rounded-full border-4 border-peephole bg-cream text-coffee transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-peephole"
          >
            <UserRoundIcon aria-hidden />
          </Link>
        </nav>
      </div>
    </header>
  );
}
