import { z } from 'zod';
import { roles } from '../entities/User';

export const EDIT_USER_SCHEMA = z.object({
  displayName: z.string().trim().max(255).optional(),
  role: z.enum(roles).optional(),
});

export type EditUserData = z.infer<typeof EDIT_USER_SCHEMA>;

export const CREATE_USER_SCHEMA = z.object({
  username: z.string().trim().max(255).regex(/^(?![._])[a-zA-Z0-9._]+(?<![._])$/),
  displayName: z.string().trim().max(255).optional(),
  role: z.enum(roles),
});

export type CreateUserData = z.infer<typeof CREATE_USER_SCHEMA>;

// Enforce passwords to be at least 8 characters long.
// Enforce passwords to have a lowercase, an uppercase, a number and a special character
const passwordSchema = z.string().trim().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/);

export const CHANGE_TEMP_PASSWORD_SCHEMA = z.object({
  newPassword: passwordSchema,
  repeatPassword: passwordSchema,
});

export type ChangeTempPassword = z.infer<typeof CHANGE_TEMP_PASSWORD_SCHEMA>;

export const CHANGE_PASSWORD_SCHEMA = CHANGE_TEMP_PASSWORD_SCHEMA.extend({
  currentPassword: z.string().trim(), // Current password may be autogenerated, so we allow anything
});
