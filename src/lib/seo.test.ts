import { describe, expect, it } from "vitest";

import {
  breadcrumbListJsonLd,
  cafeOrCoffeeShopJsonLd,
  productJsonLd,
  toJsonLdJson,
  toPesos,
} from "@/lib/seo";

describe("toPesos", () => {
  it("formats whole pesos in decimal notation", () => {
    expect(toPesos(250)).toBe("250.00");
    expect(toPesos(40)).toBe("40.00");
    expect(toPesos(1995)).toBe("1995.00");
  });
});

describe("toJsonLdJson", () => {
  it("escapes closing script tags to keep the JSON parseable and safe", () => {
    const serialized = toJsonLdJson({ script: "</script><div>" });

    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script>");
  });
});

describe("breadcrumbListJsonLd", () => {
  it("maps items to ListItem with sequential positions", () => {
    const data = breadcrumbListJsonLd([
      { name: "Menú", href: "/menu" },
      { name: "Cafés" },
      { name: "Espresso" },
    ]);

    expect(data.itemListElement).toHaveLength(3);
    expect(data.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Menú",
      item: expect.stringContaining("/menu"),
    });
    expect(data.itemListElement[1]).toEqual({
      "@type": "ListItem",
      position: 2,
      name: "Cafés",
    });
    expect(data.itemListElement[2]).toEqual({
      "@type": "ListItem",
      position: 3,
      name: "Espresso",
    });
  });
});

describe("cafeOrCoffeeShopJsonLd", () => {
  it("builds the business entity with NAP and opening hours", () => {
    const data = cafeOrCoffeeShopJsonLd();

    expect(data["@type"]).toBe("CafeOrCoffeeShop");
    expect(data.name).toBeTruthy();
    expect(data.telephone).toBeTruthy();
    expect(data.address.addressCountry).toBe("ES");
    expect(data.url).toContain("/menu");
    expect(data.hasMenu).toContain("/menu");
    expect(data.openingHoursSpecification.length).toBeGreaterThan(0);
    expect(data.openingHoursSpecification[0]).toMatchObject({
      "@type": "OpeningHoursSpecification",
    });
  });
});

describe("productJsonLd", () => {
  const base = {
    slug: "espresso",
    name: "Espresso",
    description: "Un espresso corto",
    price: 250,
    available: true,
    imageUrl: null,
    ratingSummary: { average: null, count: 0 },
  };

  it("omits aggregateRating until there is real rating data", () => {
    expect(productJsonLd(base)).not.toHaveProperty("aggregateRating");
  });

  it("adds aggregateRating only with real data", () => {
    const data = productJsonLd({
      ...base,
      ratingSummary: { average: 4.6, count: 12 },
    });

    expect(data.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: "4.6",
      bestRating: 5,
      worstRating: 1,
      ratingCount: 12,
    });
  });

  it("exposes the offer in CUP with schema availability", () => {
    expect(productJsonLd(base).offers).toEqual({
      "@type": "Offer",
      price: "250.00",
      priceCurrency: "CUP",
      url: expect.stringContaining("/menu/espresso"),
      availability: "https://schema.org/InStock",
    });
  });

  it("marks out-of-stock products as not available", () => {
    const data = productJsonLd({ ...base, available: false });

    expect(data.offers.availability).toBe("https://schema.org/OutOfStock");
  });

  it("uses the image only when one exists", () => {
    expect(productJsonLd(base)).not.toHaveProperty("image");
    expect(
      productJsonLd({ ...base, imageUrl: "https://img/01.jpg" }).image,
    ).toBe("https://img/01.jpg");
  });
});
