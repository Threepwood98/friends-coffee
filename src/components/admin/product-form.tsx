"use client";

import { CircleAlertIcon } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import {
  createProductAction,
  updateProductAction,
  type ProductFormActionState,
} from "@/actions/products";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

export interface ProductFormOption {
  id: string;
  name: string;
}

export interface ProductFormProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  available: boolean;
  imageUrl: string | null;
  categoryId: string;
}

interface ProductFormProps {
  categories: ProductFormOption[];
  product?: ProductFormProduct;
}

const initialProductState: ProductFormActionState = { message: "" };

export function ProductForm({ categories, product }: ProductFormProps) {
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const submittedAction = useMemo(
    () =>
      product
        ? updateProductAction.bind(null, product.id)
        : createProductAction,
    [product],
  );
  const [state, formAction, isPending] = useActionState(
    submittedAction,
    initialProductState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.message ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>No hemos podido guardar el producto</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={false} data-disabled={isPending}>
          <FieldLabel htmlFor="product-name">Nombre</FieldLabel>
          <Input
            id="product-name"
            name="name"
            defaultValue={product?.name}
            placeholder="Ej. El americano de la tertulia"
            className="h-11"
            disabled={isPending}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="product-slug">Slug (opcional)</FieldLabel>
          <Input
            id="product-slug"
            name="slug"
            defaultValue={product?.slug}
            placeholder="se genera desde el nombre"
            className="h-11"
            disabled={isPending}
          />
          <p className="text-sm text-muted-foreground">
            Si lo dejas vacío se genera automáticamente. Cambiarlo redirige
            automáticamente la URL antigua (301).
          </p>
        </Field>

        <Field>
          <FieldLabel htmlFor="product-description">Descripción</FieldLabel>
          <Textarea
            id="product-description"
            name="description"
            defaultValue={product?.description}
            rows={4}
            placeholder="Describe el producto para la carta."
            className="min-h-24"
            disabled={isPending}
            required
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="product-price">Precio (€)</FieldLabel>
            <Input
              id="product-price"
              name="priceEuros"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              defaultValue={
                product ? (product.priceCents / 100).toFixed(2) : ""
              }
              placeholder="0.00"
              className="h-11"
              disabled={isPending}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="product-category">Categoría</FieldLabel>
            <select
              id="product-category"
              name="categoryId"
              defaultValue={product?.categoryId}
              disabled={isPending || categories.length === 0}
              className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 ? (
              <p className="text-sm text-destructive">
                Crea una categoría antes de añadir productos.
              </p>
            ) : null}
          </Field>
        </div>

        <Field>
          <label
            htmlFor="product-available"
            className="flex min-h-11 items-center gap-3 rounded-lg border px-3 text-sm font-medium"
          >
            <input
              id="product-available"
              name="available"
              type="checkbox"
              value="on"
              defaultChecked={product?.available ?? true}
              disabled={isPending}
              className="size-4 accent-primary"
            />
            Disponible en la carta
          </label>
        </Field>

        <Field>
          <FieldLabel>Imagen del producto</FieldLabel>
          <ImageUploader imageUrl={imageUrl} onImageUrlChange={setImageUrl} />
          <input type="hidden" name="imageUrl" value={imageUrl} />
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" className="h-11" disabled={isPending}>
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          {isPending
            ? "Guardando..."
            : product
              ? "Guardar cambios"
              : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
