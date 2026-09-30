import { describe, expect, it } from "vitest";
import { v2 as cloudinary } from "cloudinary";

import {
  computeCloudinarySignature,
  getCloudinaryPublicId,
} from "@/lib/cloudinary";
import { validateImageUploadFile } from "@/lib/image-upload-policy";

const API_SECRET = "test-api-secret";
const FOLDER = "friends-coffee/products";

describe("computeCloudinarySignature", () => {
  it("matches the Cloudinary SDK signature for the same parameters", () => {
    const params = {
      allowed_formats: "jpg,jpeg,png,webp",
      folder: FOLDER,
      max_bytes: 3 * 1024 * 1024,
      timestamp: 1_700_000_000,
    };

    const expected = cloudinary.utils.api_sign_request(params, API_SECRET);

    expect(computeCloudinarySignature(params, API_SECRET)).toBe(expected);
  });

  it("is deterministic for the same parameters", () => {
    const params = { timestamp: 1_700_000_000, folder: FOLDER };

    const first = computeCloudinarySignature(params, API_SECRET);
    const second = computeCloudinarySignature(params, API_SECRET);

    expect(first).toBe(second);
    expect(first).toHaveLength(40);
  });

  it("is insensitive to parameter insertion order", () => {
    const first = computeCloudinarySignature(
      { timestamp: 123, folder: FOLDER, max_bytes: 100 },
      API_SECRET,
    );
    const second = computeCloudinarySignature(
      { max_bytes: 100, folder: FOLDER, timestamp: 123 },
      API_SECRET,
    );

    expect(first).toBe(second);
  });
});

describe("validateImageUploadFile", () => {
  it("accepts a small JPG", () => {
    expect(
      validateImageUploadFile({ type: "image/jpeg", size: 1024 }),
    ).toBeNull();
  });

  it("accepts webp and png", () => {
    expect(validateImageUploadFile({ type: "image/png", size: 10 })).toBeNull();
    expect(
      validateImageUploadFile({ type: "image/webp", size: 10 }),
    ).toBeNull();
  });

  it("rejects formats outside the whitelist", () => {
    expect(validateImageUploadFile({ type: "image/gif", size: 10 })).toContain(
      "JPG, PNG o WebP",
    );
    expect(
      validateImageUploadFile({ type: "image/svg+xml", size: 10 }),
    ).toContain("JPG, PNG o WebP");
    expect(validateImageUploadFile({ type: "text/plain", size: 10 })).toContain(
      "JPG, PNG o WebP",
    );
  });

  it("rejects files larger than 3 MB", () => {
    const overLimit = validateImageUploadFile({
      type: "image/png",
      size: 3 * 1024 * 1024 + 1,
    });

    expect(overLimit).toContain("3 MB");

    expect(
      validateImageUploadFile({ type: "image/png", size: 3 * 1024 * 1024 }),
    ).toBeNull();
  });
});

describe("getCloudinaryPublicId", () => {
  it("extracts folder + public id without version and extension", () => {
    const url = `https://res.cloudinary.com/demo/image/upload/v1700000000/${FOLDER}/latte-art.jpg`;

    expect(getCloudinaryPublicId(url, "demo", FOLDER)).toBe(
      `${FOLDER}/latte-art`,
    );
  });

  it("handles URLs without a version component", () => {
    const url = `https://res.cloudinary.com/demo/image/upload/${FOLDER}/espresso.png`;

    expect(getCloudinaryPublicId(url, "demo", FOLDER)).toBe(
      `${FOLDER}/espresso`,
    );
  });

  it("returns null for non-Cloudinary URLs", () => {
    expect(
      getCloudinaryPublicId("https://images.example.com/a.jpg", "demo", FOLDER),
    ).toBeNull();
  });

  it("returns null when the image is outside the product folder", () => {
    const url = "https://res.cloudinary.com/demo/image/upload/v1/other/x.jpg";

    expect(getCloudinaryPublicId(url, "demo", FOLDER)).toBeNull();
  });
});
