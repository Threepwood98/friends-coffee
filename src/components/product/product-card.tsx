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
        <div className="relative aspect-square w-full overflow-hidden">
          <ProductImage
            imageUrl={product.imageUrl}
            categorySlug={categorySlug}
            alt={`${product.name}`}
            className={cn(
              "motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105",
              !product.available && "grayscale brightness-75",
            )}
          />
          {!product.available && (
            <Badge
              id={`product-${product.id}-availability`}
              variant="destructive"
              className="absolute top-4 right-4 border-2 border-destructive uppercase tracking-wide font-bold"
            >
              AGOTADO
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

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 pt-1 font-heading text-base sm:px-4 sm:text-lg">
          <span
            aria-label={`Precio: ${product.price} pesos cubanos`}
            className="font-heading tabular-nums"
          >
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="flex items-center gap-1"
              aria-label={`${product.commentCount} ${product.commentCount === 1 ? "comentario" : "comentarios"}`}
            >
              <MessageCircle className="size-4 stroke-3" aria-hidden />
              <span aria-hidden>{product.commentCount}</span>
            </span>
            <span className="flex items-center gap-1" aria-label={ratingLabel}>
              <StarIcon
                className={cn(
                  "size-4 stroke-3",
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
