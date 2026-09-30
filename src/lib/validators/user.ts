import { z } from "zod";

export const USER_ROLES = ["USER", "ADMIN"] as const;

export const userRoleSchema = z.enum(USER_ROLES);

export type UserRole = z.infer<typeof userRoleSchema>;

export function resolveUserRole(value: unknown): UserRole {
  const role = userRoleSchema.safeParse(value);

  return role.success ? role.data : "USER";
}
