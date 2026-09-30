"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "cn";

import { exampleBusinessDetails, navigation } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {exampleBusinessDetails.name}
        </Link>

        <nav aria-label="Principal" className="hidden sm:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href)
                        ? "page"
                        : undefined
                  }
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    "aria-[current]:text-foreground aria-[current]:underline aria-[current]:underline-offset-4",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          aria-controls="menu-movil"
          className="inline-flex size-11 items-center justify-center rounded-md border sm:hidden"
        >
          <span className="sr-only">
            {isOpen ? "Cerrar menú" : "Abrir menú"}
          </span>
          {isOpen ? (
            <X aria-hidden className="size-5" />
          ) : (
            <Menu aria-hidden className="size-5" />
          )}
        </button>
      </div>

      {isOpen && (
        <nav
          id="menu-movil"
          aria-label="Principal"
          className="border-t sm:hidden"
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href)
                        ? "page"
                        : undefined
                  }
                  className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground aria-[current]:text-foreground aria-[current]:underline aria-[current]:underline-offset-4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
