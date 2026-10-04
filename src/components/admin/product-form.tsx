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
  price: number;
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
  const [isImageUploading, setIsImageUploading] = useState(false);
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
    <form
      action={formAction}
      aria-busy={isPending || isImageUploading}
      className="flex min-w-0 flex-col gap-6"
    >
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
            placeholder="Ej. El americano de la tertulia…"
            maxLength={100}
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
            placeholder="Se genera desde el nombre…"
            maxLength={120}
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
            placeholder="Describe el producto para la carta…"
            maxLength={1000}
            className="min-h-28 md:text-base"
            disabled={isPending}
            required
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="product-price">Precio (CUP)</FieldLabel>
            <Input
              id="product-price"
              name="priceCup"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              defaultValue={product ? String(product.price) : ""}
              placeholder="0"
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
              className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
            className="flex min-h-12 items-center gap-3 rounded-lg border px-3 text-sm font-medium"
          >
            <input
              id="product-available"
              name="available"
              type="checkbox"
              value="on"
              defaultChecked={product?.available ?? true}
              disabled={isPending}
              className="size-5 accent-primary"
            />
            Disponible en la carta
          </label>
        </Field>

        <Field>
          <FieldLabel>Imagen del producto</FieldLabel>
          <ImageUploader
            imageUrl={imageUrl}
            onImageUrlChange={setImageUrl}
            onUploadingChange={setIsImageUploading}
          />
          <input type="hidden" name="imageUrl" value={imageUrl} />
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={isPending || isImageUploading}
        >
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          {isPending
            ? "Guardando…"
            : product
              ? "Guardar cambios"
              : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
