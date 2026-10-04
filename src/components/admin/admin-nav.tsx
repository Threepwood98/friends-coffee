"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Coffee,
  FolderOpen,
  LayoutDashboard,
  MessageSquareText,
} from "lucide-react";

import { cn } from "cn";

const NAV_ITEMS = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Coffee },
  { href: "/admin/categorias", label: "Categorías", icon: FolderOpen },
  { href: "/admin/comentarios", label: "Comentarios", icon: MessageSquareText },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación de administración"
      className="-mx-4 overflow-x-auto overscroll-x-contain px-4 py-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:min-w-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex w-max items-center gap-1 pr-4 sm:pr-6 lg:pr-0">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
