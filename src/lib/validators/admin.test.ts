import { describe, expect, it } from "vitest";

import {
  categoryFormSchema,
  productFormSchema,
  slugify,
} from "@/lib/validators/admin";

describe("slugify", () => {
  it("lowercases and kebab-cases", () => {
    expect(slugify("Café con Leche")).toBe("cafe-con-leche");
  });

  it("strips accents", () => {
    expect(slugify("Té Chai Especiado")).toBe("te-chai-especiado");
  });

  it("collapses separators and trims", () => {
    expect(slugify("  Chocolate   a la taza  ")).toBe("chocolate-a-la-taza");
    expect(slugify("café-mocca")).toBe("cafe-mocca");
  });

  it("returns empty string when input has no usable characters", () => {
    expect(slugify("???")).toBe("");
  });
});

const validProductForm = {
  name: "Cortado",
  slug: "",
  description: "Espresso con un chorrito de leche.",
  priceCup: "250",
  categoryId: "cat-1",
  available: "on",
  imageUrl: "",
};

describe("productFormSchema", () => {
  it("parses pesos as a whole number", () => {
    const result = productFormSchema.safeParse(validProductForm);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.priceCup).toBe(250);
    }
  });

  it("rejects a fractional price", () => {
    const result = productFormSchema.safeParse({
      ...validProductForm,
      priceCup: "170.5",
    });

    expect(result.success).toBe(false);
  });

  it("accepts any amount without an upper limit", () => {
    const result = productFormSchema.safeParse({
      ...validProductForm,
      priceCup: "500000",
    });

    expect(result.success).toBe(true);
  });

  it("treats a missing availability checkbox as false", () => {
    const result = productFormSchema.safeParse({
      ...validProductForm,
      available: undefined,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.available).toBe(false);
    }
  });

  it("rejects missing name", () => {
    const result = productFormSchema.safeParse({
      ...validProductForm,
      name: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a negative price", () => {
    const result = productFormSchema.safeParse({
      ...validProductForm,
      priceCup: "-1",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a description over 1000 characters", () => {
    const result = productFormSchema.safeParse({
      ...validProductForm,
      description: "a".repeat(1001),
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty category id", () => {
    const result = productFormSchema.safeParse({
      ...validProductForm,
      categoryId: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a long valid description", () => {
    const result = productFormSchema.safeParse({
      ...validProductForm,
      description: "a".repeat(1000),
    });

    expect(result.success).toBe(true);
  });
});

const validCategoryForm = {
  name: "Cafés",
  slug: "cafes",
  position: "2",
};

describe("categoryFormSchema", () => {
  it("coerces the position to a number", () => {
    const result = categoryFormSchema.safeParse(validCategoryForm);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.position).toBe(2);
    }
  });

  it("rejects a negative position", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategoryForm,
      position: "-3",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a blank name", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategoryForm,
      name: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a name of exactly 50 characters", () => {
    const result = categoryFormSchema.safeParse({
      ...validCategoryForm,
      name: "a".repeat(50),
    });

    expect(result.success).toBe(true);
  });
});
