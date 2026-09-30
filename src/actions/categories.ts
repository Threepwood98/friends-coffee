"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import {
  categoryFormSchema,
  firstZodMessage,
  slugify,
  type CategoryFormInput,
} from "@/lib/validators/admin";

export interface CategoryFormActionState {
  message: string;
}

function readCategoryForm(formData: FormData): unknown {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    position: formData.get("position"),
  };
}

function resolveCategorySlug(input: CategoryFormInput): string {
  const trimmedSlug = input.slug.trim();

  return trimmedSlug !== "" ? trimmedSlug : slugify(input.name);
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/carta", "layout");
}

export async function createCategoryAction(
  _previousState: CategoryFormActionState,
  formData: FormData,
): Promise<CategoryFormActionState> {
  await requireAdmin();

  const parsed = categoryFormSchema.safeParse(readCategoryForm(formData));

  if (!parsed.success) {
    return { message: firstZodMessage(parsed.error) };
  }

  const input = parsed.data;
  const slug = resolveCategorySlug(input);
  const prisma = await getPrisma();

  try {
    await prisma.category.create({
      data: {
        name: input.name,
        slug,
        position: input.position,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        message: "Ya existe una categoría con ese nombre o slug.",
      };
    }

    console.error("Category creation failed.", error);
    return { message: "No hemos podido crear la categoría." };
  }

  revalidateCatalog();
  redirect("/admin/categorias");
}

export async function updateCategoryAction(
  categoryId: string,
  _previousState: CategoryFormActionState,
  formData: FormData,
): Promise<CategoryFormActionState> {
  await requireAdmin();

  const parsed = categoryFormSchema.safeParse(readCategoryForm(formData));

  if (!parsed.success) {
    return { message: firstZodMessage(parsed.error) };
  }

  const input = parsed.data;
  const slug = resolveCategorySlug(input);
  const prisma = await getPrisma();

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: input.name,
        slug,
        position: input.position,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        message: "Ya existe una categoría con ese nombre o slug.",
      };
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { message: "La categoría ya no existe." };
    }

    console.error("Category update failed.", error);
    return { message: "No hemos podido actualizar la categoría." };
  }

  revalidateCatalog();

  return { message: "" };
}

export async function deleteCategoryAction(
  categoryId: string,
): Promise<{ message: string }> {
  await requireAdmin();
  const prisma = await getPrisma();

  try {
    await prisma.category.delete({ where: { id: categoryId } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        message:
          "No se puede eliminar una categoría que contiene productos. Mueve o borra sus productos primero.",
      };
    }

    console.error("Category deletion failed.", error);
    return { message: "No hemos podido eliminar la categoría." };
  }

  revalidateCatalog();

  return { message: "" };
}
