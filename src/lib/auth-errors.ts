const INVALID_CREDENTIAL_CODES = new Set([
  "INVALID_EMAIL_OR_PASSWORD",
  "INVALID_PASSWORD",
  "USER_NOT_FOUND",
]);

const EXISTING_USER_CODES = new Set([
  "USER_ALREADY_EXISTS",
  "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
]);

const ACCOUNT_LINKING_ERRORS = new Set([
  "account_already_linked_to_different_user",
  "email_does_not_match",
  "unable_to_link_account",
]);

export function getLoginActionErrorMessage(
  code: string | undefined,
  statusCode: number,
) {
  if (code && INVALID_CREDENTIAL_CODES.has(code)) {
    return "El correo o la contraseña no son correctos.";
  }

  if (statusCode === 429) {
    return "Has hecho demasiados intentos. Espera unos minutos antes de volver a probar.";
  }

  return "No hemos podido iniciar sesión. Inténtalo de nuevo.";
}

export function isExistingUserError(code: string | undefined) {
  return Boolean(code && EXISTING_USER_CODES.has(code));
}

export function getOAuthErrorMessage(error: string | undefined) {
  if (!error) {
    return undefined;
  }

  if (error === "access_denied") {
    return "No se ha autorizado el acceso con esa cuenta.";
  }

  if (ACCOUNT_LINKING_ERRORS.has(error)) {
    return "No hemos podido asociar esa cuenta de Google. Accede con el método que ya usas.";
  }

  if (error === "email_not_found" || error === "email_not_verified") {
    return "La cuenta de Google no tiene un correo válido para completar el acceso.";
  }

  return "No hemos podido completar el acceso. Inténtalo de nuevo.";
}
