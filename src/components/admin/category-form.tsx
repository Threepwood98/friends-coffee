"use client";

import { CircleAlertIcon } from "lucide-react";
import { useActionState, useMemo } from "react";

import {
  createCategoryAction,
  updateCategoryAction,
  type CategoryFormActionState,
} from "@/actions/categories";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { LinkButton } from "@/components/admin/link-button";

export interface CategoryFormCategory {
  id: string;
  slug: string;
  name: string;
  position: number;
}

interface CategoryFormProps {
  category?: CategoryFormCategory;
}

const initialCategoryState: CategoryFormActionState = { message: "" };

export function CategoryForm({ category }: CategoryFormProps) {
  const submittedAction = useMemo(
    () =>
      category
        ? updateCategoryAction.bind(null, category.id)
        : createCategoryAction,
    [category],
  );
  const [state, formAction, isPending] = useActionState(
    submittedAction,
    initialCategoryState,
  );

  return (
    <form
      action={formAction}
      aria-busy={isPending}
      className="flex min-w-0 flex-col gap-6"
    >
      {state.message ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>No hemos podido guardar la categoría</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="category-name">Nombre</FieldLabel>
          <Input
            id="category-name"
            name="name"
            defaultValue={category?.name}
            placeholder="Ej. Cafés…"
            maxLength={50}
            disabled={isPending}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="category-slug">Slug (opcional)</FieldLabel>
          <Input
            id="category-slug"
            name="slug"
            defaultValue={category?.slug}
            placeholder="Se genera desde el nombre…"
            maxLength={120}
            disabled={isPending}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="category-position">Posición</FieldLabel>
          <Input
            id="category-position"
            name="position"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            defaultValue={category?.position ?? 0}
            disabled={isPending}
            required
          />
        </Field>
      </FieldGroup>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          {isPending
            ? "Guardando…"
            : category
              ? "Guardar cambios"
              : "Crear categoría"}
        </Button>
        {category ? (
          <LinkButton
            href="/admin/categorias"
            variant="ghost"
            className="w-full sm:w-auto"
          >
            Cancelar
          </LinkButton>
        ) : null}
      </div>
    </form>
  );
}
