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
    <div className="flex flex-col gap-4">
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
                className="gap-1"
              >
                <FieldLabel
                  htmlFor="register-name"
                  className="pl-3 font-heading"
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
                  aria-errormessage={
                    fieldState.invalid ? "register-name-error" : undefined
                  }
                  className="h-12 rounded-full bg-peephole px-4 text-base text-coffee md:text-base"
                  required
                />
                {fieldState.invalid ? (
                  <FieldError
                    id="register-name-error"
                    errors={[fieldState.error]}
                  />
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
                className="gap-1"
              >
                <FieldLabel
                  htmlFor="register-email"
                  className="pl-3 font-heading"
                >
                  Correo
                </FieldLabel>
                <Input
                  {...field}
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  placeholder="unagi@pivot.cat"
                  maxLength={254}
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  aria-errormessage={
                    fieldState.invalid ? "register-email-error" : undefined
                  }
                  className="h-12 rounded-full bg-peephole px-4 text-base text-coffee md:text-base"
                  required
                />
                {fieldState.invalid ? (
                  <FieldError
                    id="register-email-error"
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
                  htmlFor="register-password"
                  className="pl-3 font-heading"
                >
                  Contraseña
                </FieldLabel>
                <Input
                  {...field}
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="********"
                  minLength={8}
                  maxLength={128}
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  aria-describedby="register-password-description"
                  aria-errormessage={
                    fieldState.invalid ? "register-password-error" : undefined
                  }
                  className="h-12 rounded-full bg-peephole px-4 text-base text-coffee md:text-base"
                  required
                />
                <FieldDescription
                  id="register-password-description"
                  className="pl-3 text-xs"
                >
                  Usa al menos 8 caracteres
                </FieldDescription>
                {fieldState.invalid ? (
                  <FieldError
                    id="register-password-error"
                    errors={[fieldState.error]}
                  />
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
                className="gap-1"
              >
                <FieldLabel
                  htmlFor="register-confirm-password"
                  className="pl-3 font-heading"
                >
                  Confirmar
                </FieldLabel>
                <Input
                  {...field}
                  id="register-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="********"
                  maxLength={128}
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  aria-errormessage={
                    fieldState.invalid
                      ? "register-confirm-password-error"
                      : undefined
                  }
                  className="h-12 rounded-full bg-peephole px-4 text-base text-coffee md:text-base"
                  required
                />
                {fieldState.invalid ? (
                  <FieldError
                    id="register-confirm-password-error"
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
          className="h-12 w-full rounded-full font-heading focus-visible:border-peephole focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peephole"
          disabled={isPending}
        >
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          {isPending ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      {googleSignIn ? (
        <>
          <FieldSeparator className="my-0 text-xs **:data-[slot=field-separator-content]:bg-door">
            o continúa con
          </FieldSeparator>
          {googleSignIn}
        </>
      ) : null}

      <p className="text-center text-sm leading-6 text-primary-foreground/80">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="inline-flex min-h-11 items-center font-heading text-peephole underline underline-offset-2 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peephole"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
