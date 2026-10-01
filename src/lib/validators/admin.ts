import { z } from "zod";

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const slugInputSchema = z.string().trim().max(120);

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Escribe un nombre.").max(100),
  slug: slugInputSchema,
  description: z
    .string()
    .trim()
    .min(1, "Escribe una descripción.")
    .max(1000, "La descripción no puede superar los 1000 caracteres."),
  priceCup: z.coerce.number().int().min(0),
  categoryId: z.string().trim().min(1, "Elige una categoría."),
  available: z.preprocess(
    (value) =>
      value === "on" || value === "true" || value === "1" || value === true,
    z.boolean(),
  ),
  imageUrl: z.string().trim().max(500).optional(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Escribe un nombre.").max(50),
  slug: slugInputSchema,
  position: z.coerce
    .number()
    .int()
    .min(0, "La posición no puede ser negativa."),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;

export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Revisa los datos del formulario.";
}
