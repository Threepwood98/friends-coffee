"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { cn } from "cn";

import { navigation } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-coffee/10 bg-card/90 backdrop-blur-md">
      <div
        aria-hidden
        className="h-1 bg-gradient-to-r from-primary via-peephole to-accent"
      />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/menu"
          aria-label="Friends Coffee — Menú"
          className="flex min-h-11 shrink-0 items-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, no optimization needed */}
          <img
            src="/images/Friends_logo.svg"
            alt="Friends Coffee"
            width={1185}
            height={196}
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <Link
          href="/cuenta"
          aria-current={pathname.startsWith("/cuenta") ? "page" : undefined}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-peephole bg-card px-3 text-xs font-semibold text-coffee transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current]:border-primary aria-[current]:bg-primary aria-[current]:text-primary-foreground sm:hidden"
        >
          <UserRound className="size-4" aria-hidden />
          Cuenta
        </Link>

        <nav aria-label="Principal" className="hidden sm:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={
                    pathname.startsWith(item.href) ? "page" : undefined
                  }
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/15 hover:text-coffee focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    "aria-[current]:bg-primary aria-[current]:text-primary-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
