const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const PLACEHOLDER_BY_CATEGORY: Record<string, string> = {
  cafes: "/images/placeholders/cafes.svg",
  especialidades: "/images/placeholders/especialidades.svg",
  dulces: "/images/placeholders/dulces.svg",
  salados: "/images/placeholders/salados.svg",
};

export const DEFAULT_PLACEHOLDER_IMAGE = "/images/placeholders/default.svg";

export function formatPrice(priceCents: number): string {
  return currencyFormatter.format(priceCents / 100);
}

interface ImageSourceCandidate {
  imageUrl: string | null;
  category: { slug: string };
}

export function resolveProductImage(product: ImageSourceCandidate): string {
  if (product.imageUrl) {
    return product.imageUrl;
  }

  return (
    PLACEHOLDER_BY_CATEGORY[product.category.slug] ?? DEFAULT_PLACEHOLDER_IMAGE
  );
}
