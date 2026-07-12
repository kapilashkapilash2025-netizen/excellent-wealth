import { z } from 'zod';
import { currencyCodeSchema } from './currency.js';
import { displayNameSchema, timezoneSchema } from './locale.js';

// Requires at least one lowercase letter, one uppercase letter, one digit,
// and a minimum length of 12 characters. Deliberately does not require a
// specific special character set, following current NIST guidance that
// favours passphrase length over arbitrary composition rules.
const PASSWORD_MIN_LENGTH = 12;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(256, 'Password must be at most 256 characters')
  .refine((value) => /[a-z]/.test(value), 'Password must include a lowercase letter')
  .refine((value) => /[A-Z]/.test(value), 'Password must include an uppercase letter')
  .refine((value) => /\d/.test(value), 'Password must include a digit');

export const registrationInputSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
    displayName: displayNameSchema,
    currency: currencyCodeSchema.default('USD'),
    timezone: timezoneSchema.default('UTC'),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginInputSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export type RegistrationInput = z.infer<typeof registrationInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
