import Image from "next/image";
import { cn } from "cn";

import { resolveProductImage } from "@/lib/format";

interface ProductImageProps {
  imageUrl: string | null;
  categorySlug: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

export function ProductImage({
  imageUrl,
  categorySlug,
  alt,
  sizes,
  priority = false,
  className,
}: ProductImageProps) {
  const src = resolveProductImage({
    imageUrl,
    category: { slug: categorySlug },
  });

  return (
    <Image
      src={src}
      alt={imageUrl ? alt : ""}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={src.startsWith("/")}
      className={cn("object-cover", className)}
    />
  );
}
