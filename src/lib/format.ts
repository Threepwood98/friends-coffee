const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
});

const PLACEHOLDER_BY_CATEGORY: Record<string, string> = {
  cafe: "/images/placeholders/coffee.svg",
  "espc-frias": "/images/placeholders/beverage.svg",
  snacks: "/images/placeholders/snack.svg",
  cocteleria: "/images/placeholders/cocktail.svg",
  tragos: "/images/placeholders/drink.svg",
};

export const DEFAULT_PLACEHOLDER_IMAGE = "/images/placeholders/default.svg";

export function formatPrice(price: number): string {
  return `$ ${price}`;
}

export function formatDateTime(value: Date): string {
  return dateTimeFormatter.format(value);
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
