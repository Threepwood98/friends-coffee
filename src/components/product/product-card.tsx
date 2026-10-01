import Link from "next/link";
import { MessageCircle, Star } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
        "group relative mx-auto w-full max-w-sm gap-1 overflow-hidden pt-0 pb-2 font-heading text-xs text-coffee motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1",
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-secondary/25">
        <ProductImage
          imageUrl={product.imageUrl}
          categorySlug={categorySlug}
          alt=""
          sizes="(min-width: 1280px) 18rem, (min-width: 768px) 30vw, 46vw"
          priority={priority}
          className={cn(
            "motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105",
            !product.available && "grayscale brightness-75",
          )}
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

      <h3 className="px-4 pt-2 text-center">
        <Link
          href={`/menu/${product.slug}`}
          className="after:absolute after:inset-0 after:content-[''] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {product.name}
        </Link>
      </h3>

      <div className="flex items-center justify-between px-4">
        <span className="tabular-nums">{formatPrice(product.price)}</span>
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <MessageCircle className="size-4" aria-hidden />
            <span className="sr-only">Comentarios:</span>
            {product.commentCount ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Star className="size-4" aria-hidden />
            <span className="sr-only">Valoración media:</span>
            {product.ratingAverage?.toFixed(1) ?? "–"}
          </span>
        </div>
      </div>
    </Card>
  );
}
