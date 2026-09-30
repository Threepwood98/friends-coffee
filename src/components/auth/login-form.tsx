"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";
import { startTransition, useActionState } from "react";
import { Controller, useForm } from "react-hook-form";

import { loginAction } from "@/actions/auth";
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
}

const initialState: AuthActionState = {};

export function LoginForm({ callbackUrl, initialMessage }: LoginFormProps) {
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
    <form
      action={formAction}
      onSubmit={form.handleSubmit(submitForm)}
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {message ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>No hemos podido iniciar sesión</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} data-disabled={isPending}>
              <FieldLabel htmlFor="login-email">Correo electrónico</FieldLabel>
              <Input
                {...field}
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.es"
                disabled={isPending}
                aria-invalid={fieldState.invalid}
                className="h-11"
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
            <Field data-invalid={fieldState.invalid} data-disabled={isPending}>
              <FieldLabel htmlFor="login-password">Contraseña</FieldLabel>
              <Input
                {...field}
                id="login-password"
                type="password"
                autoComplete="current-password"
                disabled={isPending}
                aria-invalid={fieldState.invalid}
                className="h-11"
                required
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="h-11 w-full" disabled={isPending}>
        {isPending ? <Spinner data-icon="inline-start" /> : null}
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
