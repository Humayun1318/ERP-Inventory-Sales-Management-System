import { z } from 'zod';
import { USER_VALIDATION, UserRole } from './user.constants';

// ---------------------------------------------------------------------------
// Reusable field definitions
// ---------------------------------------------------------------------------

export const nameSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? 'Name is required' : 'Name must be a string',
  })
  .trim()
  .min(USER_VALIDATION.NAME_MIN_LENGTH, {
    message: `Name must be at least ${USER_VALIDATION.NAME_MIN_LENGTH} characters`,
  })
  .max(USER_VALIDATION.NAME_MAX_LENGTH, {
    message: `Name cannot exceed ${USER_VALIDATION.NAME_MAX_LENGTH} characters`,
  });

// ---------------------------------------------------------------------------
// Email Schema
// ---------------------------------------------------------------------------
export const emailValidationSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? 'Email is required'
        : 'Email must be a string',
  })
  .trim()
  .superRefine((val, ctx) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(val)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid email format',
      });
    }
  })
  .transform((val) => val.toLowerCase());

// ---------------------------------------------------------------------------
// Password Schema
// ---------------------------------------------------------------------------
export const passwordValidationSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? 'Password is required'
        : 'Password must be a string',
  })
  .min(USER_VALIDATION.PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${USER_VALIDATION.PASSWORD_MIN_LENGTH} characters`,
  })
  .max(USER_VALIDATION.PASSWORD_MAX_LENGTH, {
    message: `Password cannot exceed ${USER_VALIDATION.PASSWORD_MAX_LENGTH} characters`,
  })
  .refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((val) => /\d/.test(val), {
    message: 'Password must contain at least one number',
  });

// ---------------------------------------------------------------------------
// Register Schema
// ---------------------------------------------------------------------------
export const registerSchema = z.object({
  name: nameSchema,
  email: emailValidationSchema,
  password: passwordValidationSchema,
  role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
});

export const updateUserZodSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    role: z.enum(UserRole).optional(),
    isActive: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
  })
  .strict();
