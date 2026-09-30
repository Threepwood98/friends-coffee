import { exampleBusinessDetails, siteUrl } from "@/lib/site";
import type { RatingSummaryDto } from "@/lib/interaction-types";

/**
 * Asigna un valor numérico en céntimos a notación decimal con punto,
 * el formato que exige schema.org para `Offer.price`.
 */
export function toEuros(priceCents: number): string {
  return (priceCents / 100).toFixed(2);
}

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Serializa datos JSON-LD evitando el cierre prematuro del elemento
 * `<script>` si algún valor contuviera `</script>`.
 */
export function toJsonLdJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

export function breadcrumbListJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  } as const;
}

export function cafeOrCoffeeShopJsonLd() {
  const business = exampleBusinessDetails;

  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": absoluteUrl("/#cafeteria"),
    name: business.name,
    description: business.description,
    url: siteUrl,
    telephone: business.telephone,
    email: business.email,
    image: absoluteUrl("/opengraph-image"),
    servesCuisine: "Café",
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.streetAddress,
      postalCode: business.address.postalCode,
      addressLocality: business.address.addressLocality,
      addressRegion: business.address.addressRegion,
      addressCountry: business.address.addressCountry,
    },
    openingHoursSpecification: business.hours.map((entry) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: entry.day,
      opens: entry.opens,
      closes: entry.closes,
    })),
    hasMenu: absoluteUrl("/carta"),
  } as const;
}

export function productJsonLd(input: {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  available: boolean;
  imageUrl: string | null;
  ratingSummary: RatingSummaryDto;
}) {
  const url = absoluteUrl(`/carta/${input.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: input.name,
    description: input.description,
    url,
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    ...(input.ratingSummary.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (input.ratingSummary.average ?? 0).toFixed(1),
            bestRating: 5,
            worstRating: 1,
            ratingCount: input.ratingSummary.count,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      price: toEuros(input.priceCents),
      priceCurrency: "EUR",
      url,
      availability: input.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  } as const;
}
