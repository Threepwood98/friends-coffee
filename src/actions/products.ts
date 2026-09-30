"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import {
  createProductImageUploadSignature,
  destroyCloudinaryImage,
  getProductImagePublicId,
  isCloudinaryConfigured,
  type ProductImageUploadSignature,
} from "@/lib/cloudinary";
import { getPrisma } from "@/lib/prisma";
import {
  firstZodMessage,
  priceToCents,
  productFormSchema,
  slugify,
  type ProductFormInput,
} from "@/lib/validators/admin";

export interface ProductFormActionState {
  message: string;
}

export interface UploadSignatureActionState {
  signature?: ProductImageUploadSignature;
  error?: string;
}

function readProductForm(formData: FormData): unknown {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    priceEuros: formData.get("priceEuros"),
    categoryId: formData.get("categoryId"),
    available: formData.get("available"),
    imageUrl: formData.get("imageUrl"),
  };
}

function resolveProductSlug(input: ProductFormInput): string {
  const trimmedSlug = input.slug.trim();

  return trimmedSlug !== "" ? trimmedSlug : slugify(input.name);
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/carta", "layout");
}

export async function deleteProductAction(
  productId: string,
): Promise<{ message: string }> {
  await requireAdmin();
  const prisma = await getPrisma();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { imageUrl: true },
  });

  if (!product) {
    return { message: "El producto ya no existe." };
  }

  await prisma.product.delete({ where: { id: productId } });

  const publicId = product.imageUrl
    ? getProductImagePublicId(product.imageUrl)
    : null;

  if (publicId) {
    await destroyCloudinaryImage(publicId);
  }

  revalidateCatalog();

  return { message: "" };
}

export async function createProductAction(
  _previousState: ProductFormActionState,
  formData: FormData,
): Promise<ProductFormActionState> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(readProductForm(formData));

  if (!parsed.success) {
    return { message: firstZodMessage(parsed.error) };
  }

  const input = parsed.data;
  const slug = resolveProductSlug(input);
  const prisma = await getPrisma();

  try {
    await prisma.product.create({
      data: {
        slug,
        name: input.name,
        description: input.description,
        priceCents: priceToCents(input.priceEuros),
        categoryId: input.categoryId,
        available: input.available,
        imageUrl: input.imageUrl?.trim() || null,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { message: "Ya existe un producto con ese slug." };
    }

    if (isForeignKeyError(error)) {
      return { message: "La categoría elegida ya no existe." };
    }

    console.error("Product creation failed.", error);
    return { message: "No hemos podido crear el producto." };
  }

  revalidateCatalog();
  redirect("/admin/productos");
}

export async function updateProductAction(
  productId: string,
  _previousState: ProductFormActionState,
  formData: FormData,
): Promise<ProductFormActionState> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(readProductForm(formData));

  if (!parsed.success) {
    return { message: firstZodMessage(parsed.error) };
  }

  const input = parsed.data;
  const slug = resolveProductSlug(input);
  const prisma = await getPrisma();
  const current = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true, imageUrl: true },
  });

  if (!current) {
    return { message: "El producto ya no existe." };
  }

  const nextImageUrl = input.imageUrl?.trim() || null;

  try {
    await prisma.$transaction(async (transaction) => {
      if (slug !== current.slug) {
        await transaction.productSlugRedirect.upsert({
          where: { slug: current.slug },
          update: {},
          create: { slug: current.slug, productId },
        });
      }

      await transaction.product.update({
        where: { id: productId },
        data: {
          slug,
          name: input.name,
          description: input.description,
          priceCents: priceToCents(input.priceEuros),
          categoryId: input.categoryId,
          available: input.available,
          imageUrl: nextImageUrl,
        },
      });
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { message: "Ya existe un producto con ese slug." };
    }

    if (isForeignKeyError(error)) {
      return { message: "La categoría elegida ya no existe." };
    }

    console.error("Product update failed.", error);
    return { message: "No hemos podido actualizar el producto." };
  }

  if (current.imageUrl && current.imageUrl !== nextImageUrl) {
    const publicId = getProductImagePublicId(current.imageUrl);

    if (publicId) {
      await destroyCloudinaryImage(publicId);
    }
  }

  revalidateCatalog();

  return { message: "" };
}

export async function getProductUploadSignatureAction(): Promise<UploadSignatureActionState> {
  await requireAdmin();

  if (!isCloudinaryConfigured) {
    return {
      error: "La subida de imágenes no está configurada en este entorno.",
    };
  }

  return { signature: createProductImageUploadSignature() };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function isForeignKeyError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  );
}
