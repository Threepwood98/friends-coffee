"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";

import { loginAction } from "@/actions/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
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
    <div className="flex flex-col gap-2">
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

        <FieldGroup className="gap-2">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                data-disabled={isPending}
                className="gap-0"
              >
                <FieldLabel
                  htmlFor="login-email"
                  className="pl-4 font-heading text-xs"
                >
                  Correo
                </FieldLabel>
                <Input
                  {...field}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="friends@unagi.cat"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  className="h-6 rounded-full bg-peephole text-sm"
                  required
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
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
                className="gap-0"
              >
                <FieldLabel
                  htmlFor="login-password"
                  className="pl-4 font-heading text-xs"
                >
                  Contraseña
                </FieldLabel>
                <Input
                  {...field}
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="************"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  className="h-6 rounded-full bg-peephole text-sm"
                  required
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          type="submit"
          variant="accent"
          size="xs"
          className="w-full rounded-full font-heading text-xs"
          disabled={isPending}
        >
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          {isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      {googleSignIn ? (
        <>
          <FieldSeparator className="my-0 text-[0.65rem] [&_[data-slot=field-separator-content]]:bg-door">
            o continúa con
          </FieldSeparator>
          {googleSignIn}
        </>
      ) : null}

      <p className="text-center text-[0.65rem] text-primary-foreground/80">
        ¿No tienes cuenta?{" "}
        <Link
          href={`/registro?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="inline-flex min-h-6 items-center font-heading text-peephole underline underline-offset-2 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peephole"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
