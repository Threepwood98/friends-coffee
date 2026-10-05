"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState, type ComponentProps } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type PasswordInputProps = Omit<
  ComponentProps<typeof InputGroupInput>,
  "className" | "type"
>;

export function PasswordInput({ disabled, id, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const visibilityLabel = isVisible
    ? "Ocultar contraseña"
    : "Mostrar contraseña";

  return (
    <InputGroup className="rounded-full bg-peephole text-coffee">
      <InputGroupInput
        {...props}
        id={id}
        type={isVisible ? "text" : "password"}
        disabled={disabled}
        className="h-8 text-coffee md:text-base"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          className="rounded-full"
          aria-controls={id}
          aria-label={visibilityLabel}
          aria-pressed={isVisible}
          title={visibilityLabel}
          disabled={disabled}
          onClick={() => setIsVisible((visible) => !visible)}
        >
          {isVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
