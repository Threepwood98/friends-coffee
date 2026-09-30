export const PRODUCT_IMAGE_FOLDER = "friends-coffee/products";
export const MAX_IMAGE_UPLOAD_BYTES = 3 * 1024 * 1024;
export const ALLOWED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"] as const;

export function validateImageUploadFile(file: {
  type: string;
  size: number;
}): string | null {
  const format = file.type.split("/")[1]?.toLowerCase() ?? "";

  if (!(ALLOWED_IMAGE_FORMATS as readonly string[]).includes(format)) {
    return "Solo se permiten imágenes JPG, PNG o WebP.";
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return "La imagen no puede superar los 3 MB.";
  }

  return null;
}
