"use client";

import { LoaderCircle, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { getProductUploadSignatureAction } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { validateImageUploadFile } from "@/lib/image-upload-policy";

interface ImageUploaderProps {
  imageUrl: string;
  onImageUrlChange: (imageUrl: string) => void;
}

export function ImageUploader({
  imageUrl,
  onImageUrlChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(file: File | undefined) {
    setError(null);

    if (!file) {
      return;
    }

    const clientError = validateImageUploadFile(file);

    if (clientError) {
      setError(clientError);
      return;
    }

    setIsUploading(true);

    try {
      const result = await getProductUploadSignatureAction();

      if (result.error || !result.signature) {
        setError(result.error ?? "No hemos podido iniciar la subida.");
        return;
      }

      const { signature } = result;
      const body = new FormData();
      body.set("file", file);
      body.set("api_key", signature.apiKey);
      body.set("timestamp", String(signature.timestamp));
      body.set("folder", signature.folder);
      body.set("allowed_formats", signature.allowedFormats.join(","));
      body.set("max_bytes", String(signature.maxBytes));
      body.set("signature", signature.signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
        { method: "POST", body },
      );

      if (!response.ok) {
        setError("Cloudinary ha rechazado la imagen. Prueba con otro archivo.");
        return;
      }

      const data = (await response.json()) as { secure_url?: string };

      if (!data.secure_url) {
        setError("No hemos podido obtener la imagen subida.");
        return;
      }

      onImageUrlChange(data.secure_url);
    } catch {
      setError("Ha fallado la subida. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        id="product-image-input"
        onChange={(event) => {
          void handleFileChange(event.target.files?.[0]);
        }}
      />

      <div className="flex flex-wrap items-center gap-4">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Vista previa del producto"
            className="size-20 rounded-lg object-cover ring-1 ring-foreground/10"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            <UploadCloud className="size-6" aria-hidden />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
              ) : (
                <UploadCloud className="size-4" aria-hidden />
              )}
              {isUploading
                ? "Subiendo..."
                : imageUrl
                  ? "Cambiar imagen"
                  : "Subir imagen"}
            </Button>

            {imageUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-11 text-destructive hover:text-destructive"
                onClick={() => onImageUrlChange("")}
              >
                <Trash2 className="size-4" aria-hidden />
                Quitar imagen
              </Button>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground">
            JPG, PNG o WebP · máximo 3 MB
          </p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
