"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, House, UserRound } from "lucide-react";
import { cn } from "cn";

const items = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/carta", label: "Carta", icon: Coffee },
  { href: "/cuenta", label: "Cuenta", icon: UserRound },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed right-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 z-50 rounded-3xl border border-coffee/10 bg-card/95 p-1.5 shadow-[0_22px_50px_-24px_var(--coffee)] backdrop-blur-md sm:hidden"
    >
      <ul className="grid grid-cols-3 gap-1">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-3 text-xs font-medium text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isActive && "bg-primary text-primary-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
