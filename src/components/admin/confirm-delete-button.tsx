"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface ConfirmDeleteButtonProps {
  onConfirm: () => Promise<unknown>;
  confirmLabel?: string;
  title?: string;
}

export function ConfirmDeleteButton({
  onConfirm,
  confirmLabel = "¿Seguro?",
  title,
}: ConfirmDeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  function beginConfirm() {
    setError(null);
    setIsConfirming(true);
  }

  function cancelConfirm() {
    setIsConfirming(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }

  async function confirm() {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await onConfirm();

      if (result && typeof result === "object" && "message" in result) {
        const message = (result as { message?: string }).message;

        if (message) {
          setError(message);
          setIsDeleting(false);
          setIsConfirming(false);
          return;
        }
      }

      setIsConfirming(false);
      router.refresh();
    } catch {
      setError("No hemos podido completar el borrado.");
      setIsConfirming(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isConfirming) {
    return (
      <div className="flex flex-col items-start gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="min-h-11"
            aria-label={confirmLabel}
            onClick={() => {
              void confirm();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="size-4" aria-hidden />
            )}
            Sí, borrar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={cancelConfirm}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="min-h-11 text-destructive hover:text-destructive"
        onClick={beginConfirm}
      >
        <Trash2 className="size-4" aria-hidden />
        {title ?? "Eliminar"}
      </Button>

      {error && !isConfirming ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
