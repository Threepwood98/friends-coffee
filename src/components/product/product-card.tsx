import Link from "next/link";
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
        "frame-peephole relative overflow-hidden pt-0 motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1",
        className,
      )}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        <ProductImage
          imageUrl={product.imageUrl}
          categorySlug={categorySlug}
          alt=""
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 33vw, 92vw"
          priority={priority}
        />
      </div>

      <CardHeader>
        <CardTitle className="font-heading text-2xl font-normal">
          <Link
            href={`/carta/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            {product.name}
          </Link>
        </CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-base font-semibold tabular-nums",
            !product.available && "text-muted-foreground",
          )}
        >
          {formatPrice(product.priceCents)}
        </span>
        {!product.available && <Badge variant="outline">Agotado</Badge>}
      </CardContent>
    </Card>
  );
}
