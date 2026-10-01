"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, MapPin } from "lucide-react";
import { cn } from "cn";

import { navigation } from "@/lib/site";
import { FriendsWordmark } from "@/components/brand/friends-wordmark";

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
          href="/"
          className="flex min-h-11 items-center gap-2.5 font-heading text-2xl font-normal tracking-tight text-coffee focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:text-3xl"
        >
          <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Coffee className="size-5" aria-hidden />
          </span>
          <FriendsWordmark />
        </Link>

        <div className="flex items-center gap-1.5 rounded-full border border-peephole bg-card px-3 py-2 text-xs font-medium text-coffee sm:hidden">
          <MapPin className="size-4 text-primary" aria-hidden />
          Madrid
        </div>

        <nav aria-label="Principal" className="hidden sm:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={
                    item.href === "/"
                      ? pathname === "/"
                        ? "page"
                        : undefined
                      : pathname.startsWith(item.href)
                        ? "page"
                        : undefined
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
