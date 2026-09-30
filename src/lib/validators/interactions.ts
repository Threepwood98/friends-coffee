import { z } from "zod";

export const ratingValueSchema = z
  .number()
  .int("La valoración debe ser un número entero.")
  .min(1, "La valoración mínima es 1 taza.")
  .max(5, "La valoración máxima es 5 tazas.");

export const commentTextSchema = z
  .string()
  .trim()
  .min(1, "Escribe un comentario.")
  .max(500, "El comentario no puede superar los 500 caracteres.");

export type RatingValue = z.infer<typeof ratingValueSchema>;
export type CommentText = z.infer<typeof commentTextSchema>;
