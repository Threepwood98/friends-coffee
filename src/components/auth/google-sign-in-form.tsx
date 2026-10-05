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
  label = "Google",
}: GoogleSignInFormProps) {
  return (
    <form action={disabled ? undefined : signInWithGoogleAction}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Button
        type="submit"
        variant="outline"
        className="h-8 w-full rounded-full bg-peephole text-center font-heading text-coffee hover:bg-peephole/90 focus-visible:border-peephole focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peephole"
        disabled={disabled}
      >
        {label}
      </Button>
    </form>
  );
}
