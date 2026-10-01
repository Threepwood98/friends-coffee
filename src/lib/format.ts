const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
});

const PLACEHOLDER_BY_CATEGORY: Record<string, string> = {
  "especialidades-cafe": "/images/placeholders/cafes.svg",
  "especialidades-frias": "/images/placeholders/especialidades.svg",
  snacks: "/images/placeholders/salados.svg",
  cocteleria: "/images/placeholders/especialidades.svg",
  "tragos-al-straight": "/images/placeholders/especialidades.svg",
};

export const DEFAULT_PLACEHOLDER_IMAGE = "/images/placeholders/default.svg";

export function formatPrice(priceCents: number): string {
  return currencyFormatter.format(priceCents / 100);
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
