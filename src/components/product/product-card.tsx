import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MenuProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

import { ProductImage } from "./product-image";

interface ProductCardProps {
  product: MenuProduct;
  categorySlug: string;
  priority?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  categorySlug,
  priority = false,
  className,
}: ProductCardProps) {
  return (
    <Card
      className={cn(
        "friends-raised group relative gap-0 overflow-hidden rounded-[1.65rem] border-0 bg-card py-0 ring-1 ring-coffee/10 motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1",
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-secondary/25 sm:aspect-4/3">
        <ProductImage
          imageUrl={product.imageUrl}
          categorySlug={categorySlug}
          alt=""
          sizes="(min-width: 1280px) 18rem, (min-width: 768px) 30vw, 46vw"
          priority={priority}
          className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
        />
        {!product.available && (
          <Badge
            variant="outline"
            className="absolute top-3 left-3 border-card bg-card/95 text-coffee shadow-sm"
          >
            Agotado
          </Badge>
        )}
      </div>

      <CardHeader className="gap-2 px-3 pt-4 sm:px-5 sm:pt-5">
        <CardTitle className="line-clamp-2 font-heading text-lg leading-tight font-normal sm:text-2xl">
          <Link
            href={`/carta/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            {product.name}
          </Link>
        </CardTitle>
        <CardDescription className="hidden line-clamp-2 leading-6 sm:block">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-between gap-2 px-3 pt-3 pb-4 sm:px-5 sm:pt-4 sm:pb-5">
        <span
          className={cn(
            "text-base font-bold text-primary tabular-nums sm:text-lg",
            !product.available && "text-muted-foreground",
          )}
        >
          {formatPrice(product.priceCents)}
        </span>
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-secondary/45 text-coffee transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </CardContent>
    </Card>
  );
}
