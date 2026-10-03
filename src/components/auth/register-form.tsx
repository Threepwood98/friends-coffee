"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, type ReactNode } from "react";
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
  FieldSeparator,
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
  googleSignIn?: ReactNode;
}

const initialState: AuthActionState = {};

export function RegisterForm({ callbackUrl, googleSignIn }: RegisterFormProps) {
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
    <div className="flex flex-col gap-2">
      <form
        action={formAction}
        onSubmit={form.handleSubmit(submitForm)}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        {state.message ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>Revisa el registro</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup className="gap-2">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                data-disabled={isPending}
                className="gap-0"
              >
                <FieldLabel
                  htmlFor="register-name"
                  className="font-heading text-xs pl-4"
                >
                  Nombre
                </FieldLabel>
                <Input
                  {...field}
                  id="register-name"
                  autoComplete="name"
                  placeholder="Joey Tribbiani"
                  maxLength={60}
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  className="rounded-full bg-peephole text-sm h-6"
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
              <Field
                data-invalid={fieldState.invalid}
                data-disabled={isPending}
                className="gap-0"
              >
                <FieldLabel
                  htmlFor="register-email"
                  className="font-heading text-xs pl-4"
                >
                  Correo
                </FieldLabel>
                <Input
                  {...field}
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="friends@unagi.cat"
                  maxLength={254}
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  className="rounded-full bg-peephole text-sm h-6"
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
                  htmlFor="register-password"
                  className="font-heading text-xs pl-4"
                >
                  Contraseña
                </FieldLabel>
                <Input
                  {...field}
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="************"
                  minLength={12}
                  maxLength={72}
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  className="rounded-full bg-peephole text-sm h-6"
                  required
                />
                <FieldDescription className="text-xs">
                  Usa al menos 12 caracteres
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
              <Field
                data-invalid={fieldState.invalid}
                data-disabled={isPending}
                className="gap-0"
              >
                <FieldLabel
                  htmlFor="register-confirm-password"
                  className="font-heading text-xs pl-4"
                >
                  Confirmar Contraseña
                </FieldLabel>
                <Input
                  {...field}
                  id="register-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="************"
                  maxLength={72}
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  className="rounded-full bg-peephole text-sm h-6"
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
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
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
        ¿Ya tienes cuenta?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="inline-flex min-h-6 items-center font-heading text-peephole underline underline-offset-2 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peephole"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
