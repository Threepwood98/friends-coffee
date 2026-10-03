import { LogInIcon } from "lucide-react";

import { signInWithGoogleAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

interface GoogleSignInFormProps {
  callbackUrl: string;
  disabled?: boolean;
  label?: string;
}

export function GoogleSignInForm({
  callbackUrl,
  disabled = false,
  label = "Continuar con Google",
}: GoogleSignInFormProps) {
  return (
    <form action={disabled ? undefined : signInWithGoogleAction}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Button
        type="submit"
        variant="outline"
        size="xs"
        className="w-full rounded-full bg-peephole font-heading text-xs text-coffee hover:bg-peephole/90"
        disabled={disabled}
      >
        <LogInIcon data-icon="inline-start" />
        {label}
      </Button>
    </form>
  );
}
