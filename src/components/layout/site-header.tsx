"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRoundIcon } from "lucide-react";
import { cn } from "cn";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-primary pt-[env(safe-area-inset-top)]">
      <div className="site-container flex h-(--site-header-height) items-center justify-between gap-4 py-2">
        <Link
          href="/menu"
          aria-label="Friends Coffee — Menú"
          className="flex min-h-11 shrink-0 flex-col items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-peephole"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, no optimization needed */}
          <img
            src="/images/friends_logo.svg"
            alt=""
            width={1186}
            height={196}
            className="h-6 w-auto sm:h-8"
          />
          <span className="bg-peephole px-2 font-heading text-lg leading-none tracking-[0.35em] text-black lowercase sm:tracking-[0.45em]">
            coffee
          </span>
        </Link>

        <nav aria-label="Principal" className="flex items-center gap-2">
          <Link
            href="/menu"
            aria-current={pathname.startsWith("/menu") ? "page" : undefined}
            className={cn(
              "hidden min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors hover:bg-cream hover:text-coffee focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-peephole sm:inline-flex",
              pathname.startsWith("/menu")
                ? "bg-peephole text-coffee"
                : "text-primary-foreground",
            )}
          >
            Menú
          </Link>
          <Link
            href="/cuenta"
            aria-label="Mi cuenta"
            aria-current={pathname.startsWith("/cuenta") ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border-4 border-peephole px-0 text-sm font-medium transition-colors hover:bg-cream hover:text-coffee focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-peephole sm:px-4",
              pathname.startsWith("/cuenta")
                ? "bg-peephole text-coffee"
                : "bg-cream text-coffee sm:bg-transparent sm:text-primary-foreground",
            )}
          >
            <UserRoundIcon aria-hidden />
            <span className="hidden sm:inline">Cuenta</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
