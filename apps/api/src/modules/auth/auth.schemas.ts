// Re-exports the shared validation schemas so every auth route in this
// module imports from one place, and so client (apps/web) and server always
// validate registration/login with the exact same rules.
export {
  loginInputSchema,
  registrationInputSchema,
  type LoginInput,
  type RegistrationInput,
} from '@excellent-wealth/validation';
