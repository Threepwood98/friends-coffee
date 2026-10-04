import Link from "next/link";
import { MessageCircle, StarIcon } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { MenuProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

import { ProductImage } from "./product-image";

const ratingFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 1,
});

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
  const ratingLabel =
    product.ratingAverage == null
      ? "Sin valoraciones"
      : `Valoración media: ${ratingFormatter.format(product.ratingAverage)} de 5`;

  return (
    <article className="h-full">
      <Card
        className={cn(
          "group relative mx-auto h-full w-full max-w-sm gap-1 overflow-hidden pt-0 pb-3 text-coffee motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1",
          className,
        )}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-secondary/25">
          <ProductImage
            imageUrl={product.imageUrl}
            categorySlug={categorySlug}
            alt={`Fotografía de ${product.name}`}
            sizes="(max-width: 359px) calc(100vw - 2rem), (min-width: 1280px) 17rem, (min-width: 768px) 30vw, 46vw"
            priority={priority}
            className={cn(
              "motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105",
              !product.available && "grayscale brightness-75",
            )}
          />
          {!product.available && (
            <Badge
              id={`product-${product.id}-availability`}
              variant="outline"
              className="absolute top-3 left-3 border-card bg-card/95 text-coffee shadow-sm"
            >
              Agotado
            </Badge>
          )}
        </div>

        <h3 className="px-3 pt-2 text-center font-heading text-base leading-tight sm:px-4 sm:text-lg">
          <Link
            href={`/menu/${product.slug}`}
            aria-describedby={
              product.available
                ? undefined
                : `product-${product.id}-availability`
            }
            className="line-clamp-2 min-h-[2.5em] after:absolute after:inset-0 after:content-[''] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 pt-1 text-xs sm:px-4 sm:text-sm">
          <span
            aria-label={`Precio: ${product.price} pesos cubanos`}
            className="font-heading text-base tabular-nums"
          >
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="flex items-center gap-1"
              aria-label={`${product.commentCount} ${product.commentCount === 1 ? "comentario" : "comentarios"}`}
            >
              <MessageCircle className="size-4" aria-hidden />
              <span aria-hidden>{product.commentCount}</span>
            </span>
            <span className="flex items-center gap-1" aria-label={ratingLabel}>
              <StarIcon
                className={cn(
                  "size-4",
                  product.ratingAverage != null && "fill-current text-accent",
                )}
                aria-hidden
              />
              <span aria-hidden>
                {product.ratingAverage == null
                  ? "–"
                  : ratingFormatter.format(product.ratingAverage)}
              </span>
            </span>
          </div>
        </div>
      </Card>
    </article>
  );
}
