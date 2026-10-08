import Image from "next/image";
import { cn } from "cn";

import { resolveProductImage } from "@/lib/format";

interface ProductImageProps {
  imageUrl: string | null;
  categorySlug: string;
  alt: string;
  // sizes: string;
  priority?: boolean;
  className?: string;
}

export function ProductImage({
  imageUrl,
  categorySlug,
  alt,
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
      unoptimized={src.startsWith("/")}
      className={cn("object-cover", !imageUrl && "p-8", className)}
    />
  );
}
