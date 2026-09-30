import { createHash } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

import {
  ALLOWED_IMAGE_FORMATS,
  MAX_IMAGE_UPLOAD_BYTES,
  PRODUCT_IMAGE_FOLDER,
} from "@/lib/image-upload-policy";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY?.trim() ?? "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET?.trim() ?? "";

export const isCloudinaryConfigured =
  CLOUDINARY_CLOUD_NAME !== "" &&
  CLOUDINARY_API_KEY !== "" &&
  CLOUDINARY_API_SECRET !== "";

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function computeCloudinarySignature(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const query = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${query}${apiSecret}`).digest("hex");
}

export interface ProductImageUploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: readonly string[];
  maxBytes: number;
}

export function createProductImageUploadSignature(): ProductImageUploadSignature {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    timestamp,
    folder: PRODUCT_IMAGE_FOLDER,
    allowed_formats: ALLOWED_IMAGE_FORMATS.join(","),
    max_bytes: MAX_IMAGE_UPLOAD_BYTES,
  };

  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    timestamp,
    signature: computeCloudinarySignature(params, CLOUDINARY_API_SECRET),
    folder: PRODUCT_IMAGE_FOLDER,
    allowedFormats: ALLOWED_IMAGE_FORMATS,
    maxBytes: MAX_IMAGE_UPLOAD_BYTES,
  };
}

export function getCloudinaryPublicId(
  imageUrl: string,
  cloudName: string,
  folder: string,
): string | null {
  const prefix = `https://res.cloudinary.com/${cloudName}/image/upload/`;

  if (!imageUrl.startsWith(prefix)) {
    return null;
  }

  const withoutVersion = imageUrl.slice(prefix.length).replace(/^v\d+\//, "");
  const withoutExtension = withoutVersion.replace(/\.[a-z0-9]{3,4}$/i, "");

  if (!withoutExtension.startsWith(`${folder}/`)) {
    return null;
  }

  return withoutExtension;
}

export async function destroyCloudinaryImage(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (error) {
    // Deletion is best-effort; a leftover orphan image does not break the app.
    console.error("Cloudinary image deletion failed.", error);
  }
}

export function getProductImagePublicId(imageUrl: string): string | null {
  if (!isCloudinaryConfigured) {
    return null;
  }

  return getCloudinaryPublicId(
    imageUrl,
    CLOUDINARY_CLOUD_NAME,
    PRODUCT_IMAGE_FOLDER,
  );
}
