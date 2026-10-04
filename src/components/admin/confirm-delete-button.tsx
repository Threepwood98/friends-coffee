"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface ConfirmDeleteButtonProps {
  onConfirm: () => Promise<unknown>;
  title?: string;
  itemLabel: string;
}

export function ConfirmDeleteButton({
  onConfirm,
  title,
  itemLabel,
}: ConfirmDeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocusRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (isConfirming) {
      confirmRef.current?.focus();
      return;
    }

    if (shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      triggerRef.current?.focus();
    }
  }, [isConfirming]);

  function beginConfirm() {
    setError(null);
    setIsConfirming(true);
  }

  function cancelConfirm() {
    shouldRestoreFocusRef.current = true;
    setIsConfirming(false);
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
          shouldRestoreFocusRef.current = true;
          setIsConfirming(false);
          return;
        }
      }

      setIsConfirming(false);
      document.getElementById("admin-content")?.focus();
      router.refresh();
    } catch {
      setError("No hemos podido completar el borrado.");
      shouldRestoreFocusRef.current = true;
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
            ref={confirmRef}
            type="button"
            variant="destructive"
            size="sm"
            className="min-h-11"
            aria-label={
              isDeleting ? `Borrando ${itemLabel}` : `Sí, borrar ${itemLabel}`
            }
            aria-busy={isDeleting}
            onClick={() => {
              void confirm();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <LoaderCircle
                data-icon="inline-start"
                className="motion-safe:animate-spin"
                aria-hidden
              />
            ) : (
              <Trash2 data-icon="inline-start" aria-hidden />
            )}
            {isDeleting ? "Borrando…" : "Sí, borrar"}
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
          <p role="alert" className="text-sm break-words text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="sm"
        className="min-h-11 text-destructive hover:text-destructive"
        aria-label={`${title ?? "Eliminar"} ${itemLabel}`}
        onClick={beginConfirm}
      >
        <Trash2 data-icon="inline-start" aria-hidden />
        {title ?? "Eliminar"}
      </Button>

      {error && !isConfirming ? (
        <p role="alert" className="text-sm break-words text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
