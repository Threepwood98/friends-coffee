"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";

import { loginAction } from "@/actions/auth";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  loginSchema,
  type AuthActionState,
  type LoginInput,
} from "@/lib/validators/auth";

interface LoginFormProps {
  callbackUrl: string;
  initialMessage?: string;
  googleSignIn?: ReactNode;
}

const initialState: AuthActionState = {};

export function LoginForm({
  callbackUrl,
  initialMessage,
  googleSignIn,
}: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const message = state.message ?? initialMessage;

  function submitForm(values: LoginInput) {
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("callbackUrl", callbackUrl);
    startTransition(() => formAction(formData));
  }

  return (
    <div className="flex flex-col gap-4 px-2 py-16">
      <form
        action={formAction}
        onSubmit={form.handleSubmit(submitForm)}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        {message ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>No hemos podido iniciar sesión</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup className="gap-3">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                data-disabled={isPending}
                className="gap-1"
              >
                <FieldLabel
                  htmlFor="login-email"
                  className="pl-3 font-heading text-sm"
                >
                  Correo
                </FieldLabel>
                <Input
                  {...field}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  placeholder="unagi@pivot.cat"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  aria-errormessage={
                    fieldState.invalid ? "login-email-error" : undefined
                  }
                  className="h-8 rounded-full bg-peephole text-coffee md:text-base"
                  required
                />
                {fieldState.invalid ? (
                  <FieldError
                    id="login-email-error"
                    errors={[fieldState.error]}
                  />
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                data-disabled={isPending}
                className="gap-1"
              >
                <FieldLabel
                  htmlFor="login-password"
                  className="pl-3 font-heading text-sm"
                >
                  Contraseña
                </FieldLabel>
                <PasswordInput
                  {...field}
                  id="login-password"
                  autoComplete="current-password"
                  placeholder="********"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  aria-errormessage={
                    fieldState.invalid ? "login-password-error" : undefined
                  }
                  required
                />
                {fieldState.invalid ? (
                  <FieldError
                    id="login-password-error"
                    errors={[fieldState.error]}
                  />
                ) : null}
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          type="submit"
          variant="accent"
          className="h-8 w-full rounded-full font-heading focus-visible:border-peephole focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peephole"
          disabled={isPending}
        >
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          {isPending ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      {googleSignIn}

      <p className="text-center text-sm text-primary-foreground">
        ¿No tienes cuenta?{" "}
        <Link
          href={`/registro?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="inline-flex items-center font-heading text-peephole underline underline-offset-2 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peephole"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
