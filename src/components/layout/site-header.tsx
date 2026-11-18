"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRoundIcon } from "lucide-react";
import { cn } from "cn";
import Image from "next/image";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="flex sticky top-0 z-30 bg-primary h-16 items-center px-4 py-2 justify-between">
      <Link
        href="/menu"
        aria-label="Friends Coffee — Menú"
        className="flex flex-col"
      >
        <Image
          src="/images/friends_logo.svg"
          alt="logo"
          width={1186}
          height={196}
          loading="eager"
          className="h-6 w-auto"
        />
        <span className="bg-peephole mx-auto px-2 font-heading text-lg leading-none text-black lowercase text-center">
          coffee
        </span>
      </Link>
      <Link
        href="/cuenta"
        aria-label="Mi cuenta"
        aria-current={pathname.startsWith("/cuenta") ? "page" : undefined}
        className={cn(
          "inline-flex aspect-square h-full items-center justify-center gap-2 rounded-full border-4 border-peephole font-medium transition-colors hover:bg-cream hover:text-coffee focus-visible:outline-2 sm:px-4",
          pathname.startsWith("/cuenta")
            ? "bg-peephole text-coffee"
            : "bg-cream text-coffee sm:bg-transparent sm:text-primary-foreground",
        )}
      >
        <UserRoundIcon aria-hidden />
        <span className="hidden sm:inline">Cuenta</span>
      </Link>
    </header>
  );
}
