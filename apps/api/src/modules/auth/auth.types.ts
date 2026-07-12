import type { RegistrationInput, LoginInput } from '@excellent-wealth/validation';
import type { SafeUser } from '../users/user.types.js';

export type RegisterUserInput = RegistrationInput;
export type LoginUserInput = LoginInput;

export interface AuthenticatedSession {
  sessionId: string;
  userId: string;
}

export interface AuthResult {
  user: SafeUser;
  rawSessionToken: string;
}

export interface RequestMetadata {
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
}
