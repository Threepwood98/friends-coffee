import { describe, expect, it } from "vitest";

import {
  DEFAULT_PLACEHOLDER_IMAGE,
  formatPrice,
  resolveProductImage,
} from "./format";

function normalizeSpacing(value: string): string {
  return value.replace(/\u00a0/g, " ");
}

describe("formatPrice", () => {
  it("formats integer cents as Spanish euro amounts", () => {
    expect(normalizeSpacing(formatPrice(220))).toBe("2,20 €");
    expect(normalizeSpacing(formatPrice(590))).toBe("5,90 €");
    expect(normalizeSpacing(formatPrice(0))).toBe("0,00 €");
    expect(normalizeSpacing(formatPrice(1000))).toBe("10,00 €");
  });

  it("keeps two decimals for single-cent prices", () => {
    expect(normalizeSpacing(formatPrice(205))).toBe("2,05 €");
  });
});

describe("resolveProductImage", () => {
  it("prefers the uploaded image when one exists", () => {
    expect(
      resolveProductImage({
        imageUrl: "https://res.cloudinary.com/demo/image/upload/cafes.jpg",
        category: { slug: "cafes" },
      }),
    ).toBe("https://res.cloudinary.com/demo/image/upload/cafes.jpg");
  });

  it("falls back to the placeholder of the product category", () => {
    const cases = [
      ["especialidades-cafe", "/images/placeholders/cafes.svg"],
      ["especialidades-frias", "/images/placeholders/especialidades.svg"],
      ["snacks", "/images/placeholders/salados.svg"],
      ["cocteleria", "/images/placeholders/especialidades.svg"],
      ["tragos-al-straight", "/images/placeholders/especialidades.svg"],
    ] as const;

    for (const [slug, expected] of cases) {
      expect(resolveProductImage({ imageUrl: null, category: { slug } })).toBe(
        expected,
      );
    }
  });

  it("falls back to a generic placeholder for unknown categories", () => {
    expect(
      resolveProductImage({
        imageUrl: null,
        category: { slug: "temporales-de-invierno" },
      }),
    ).toBe(DEFAULT_PLACEHOLDER_IMAGE);
  });

  it("treats an empty string as a missing image", () => {
    expect(
      resolveProductImage({
        imageUrl: "",
        category: { slug: "especialidades-cafe" },
      }),
    ).toBe("/images/placeholders/cafes.svg");
  });
});
