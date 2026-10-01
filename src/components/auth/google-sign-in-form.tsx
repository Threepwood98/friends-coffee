import { LogInIcon } from "lucide-react";

import { signInWithGoogleAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

interface GoogleSignInFormProps {
  callbackUrl: string;
}

export function GoogleSignInForm({ callbackUrl }: GoogleSignInFormProps) {
  return (
    <form action={signInWithGoogleAction}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Button
        type="submit"
        variant="outline"
        className="h-12 w-full rounded-full"
      >
        <LogInIcon data-icon="inline-start" />
        Continuar con Google
      </Button>
    </form>
  );
}
