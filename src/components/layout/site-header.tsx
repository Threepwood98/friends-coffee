"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Coffee, Menu, X } from "lucide-react";
import { cn } from "cn";

import { exampleBusinessDetails, navigation } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b bg-card">
      <div
        aria-hidden
        className="h-1 bg-gradient-to-r from-primary via-peephole to-accent"
      />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-3xl font-normal tracking-tight text-coffee focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Coffee className="size-5" aria-hidden />
          </span>
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
                    "inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/15 hover:text-coffee focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    "aria-[current]:bg-accent/15 aria-[current]:text-coffee",
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
          className="inline-flex size-11 items-center justify-center rounded-lg border transition-colors hover:bg-accent/15 sm:hidden"
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

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.nav
            id="menu-movil"
            aria-label="Principal"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden sm:hidden"
          >
            <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 pb-4">
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
                    className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-accent/15 hover:text-coffee aria-[current]:bg-accent/15 aria-[current]:text-coffee"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
