/**
 * Modular Supabase Auth - Type Definitions
 *
 * This file contains all TypeScript types and interfaces
 * used throughout the authentication module.
 */

import { User, Session } from '@supabase/supabase-js';

// ============================================================================
// Auth State Types
// ============================================================================

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
}

export interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  signOutAllDevices: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// ============================================================================
// Auth Mode Types
// ============================================================================

export type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'magic-link';

export type AuthCallbackState = 'loading' | 'success' | 'error';

export type AccountSettingsSection = null | 'password' | 'email' | 'delete';

// ============================================================================
// Auth Event Types
// ============================================================================

export type AuthEventType =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY';

// ============================================================================
// Component Props Types
// ============================================================================

export interface AuthModalProps {
  onClose: () => void;
  isFirstUser: boolean;
}

export interface AccountSettingsProps {
  user: User;
  onClose: () => void;
  isAdmin?: boolean;
}

export interface AuthCallbackProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface AuthResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

export interface SignUpResult extends AuthResult {
  needsEmailVerification: boolean;
  userId?: string;
}

export interface SignInResult extends AuthResult {
  session?: Session;
  user?: User;
}

// ============================================================================
// User Role Types
// ============================================================================

export type UserRole = 'admin' | 'user';

export interface UserMetadata {
  role?: UserRole;
  [key: string]: unknown;
}

// ============================================================================
// Database Types (matching Prisma/Supabase schema)
// ============================================================================

export interface DbUser {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface DbTaskList {
  id: string;
  name: string;
  data: unknown; // JSON data
  created_at: string;
  user_id: string | null;
  is_example: boolean;
}

// ============================================================================
// Toast Notification Types
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  type: ToastType;
  message: string;
  duration?: number;
}

// ============================================================================
// Environment Configuration Types
// ============================================================================

export interface AuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  redirectUrl: string;
  siteUrl: string;
}

// ============================================================================
// Re-exports from Supabase
// ============================================================================

export type { User, Session } from '@supabase/supabase-js';
