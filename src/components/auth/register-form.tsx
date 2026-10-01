"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";
import { startTransition, useActionState } from "react";
import { Controller, useForm } from "react-hook-form";

import { registerAction } from "@/actions/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  registrationSchema,
  type AuthActionState,
  type RegistrationInput,
} from "@/lib/validators/auth";

interface RegisterFormProps {
  callbackUrl: string;
}

const initialState: AuthActionState = {};

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function submitForm(values: RegistrationInput) {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("confirmPassword", values.confirmPassword);
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

      {state.message ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Revisa el registro</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} data-disabled={isPending}>
              <FieldLabel htmlFor="register-name">Nombre</FieldLabel>
              <Input
                {...field}
                id="register-name"
                autoComplete="name"
                placeholder="Tu nombre"
                maxLength={60}
                disabled={isPending}
                aria-invalid={fieldState.invalid}
                className="h-12 rounded-2xl bg-background/80 px-4"
                required
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} data-disabled={isPending}>
              <FieldLabel htmlFor="register-email">
                Correo electrónico
              </FieldLabel>
              <Input
                {...field}
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.es"
                maxLength={254}
                disabled={isPending}
                aria-invalid={fieldState.invalid}
                className="h-12 rounded-2xl bg-background/80 px-4"
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
              <FieldLabel htmlFor="register-password">Contraseña</FieldLabel>
              <Input
                {...field}
                id="register-password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                disabled={isPending}
                aria-invalid={fieldState.invalid}
                className="h-12 rounded-2xl bg-background/80 px-4"
                required
              />
              <FieldDescription>
                Usa al menos 12 caracteres. bcrypt admite hasta 72 bytes.
              </FieldDescription>
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} data-disabled={isPending}>
              <FieldLabel htmlFor="register-confirm-password">
                Repite la contraseña
              </FieldLabel>
              <Input
                {...field}
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                maxLength={72}
                disabled={isPending}
                aria-invalid={fieldState.invalid}
                className="h-12 rounded-2xl bg-background/80 px-4"
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
        className="h-12 w-full rounded-full"
        disabled={isPending}
      >
        {isPending ? <Spinner data-icon="inline-start" /> : null}
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
