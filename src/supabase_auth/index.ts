/**
 * ============================================================================
 * MODULAR SUPABASE AUTH
 * ============================================================================
 *
 * A complete, reusable authentication system built on Supabase.
 *
 * Features:
 * - Email/password authentication
 * - Magic link (passwordless) sign in
 * - Google OAuth integration
 * - Password reset flow
 * - Email change with verification
 * - Account deletion
 * - Session management
 * - Role-based access (admin/user)
 *
 * Quick Start:
 * ```tsx
 * import { useAuth, AuthModal, supabase } from '@/auth';
 *
 * function App() {
 *   const { user, loading, isAdmin, signOut } = useAuth();
 *   const [showAuth, setShowAuth] = useState(false);
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {user ? (
 *         <>
 *           <p>Welcome, {user.email}</p>
 *           <button onClick={signOut}>Sign Out</button>
 *         </>
 *       ) : (
 *         <button onClick={() => setShowAuth(true)}>Sign In</button>
 *       )}
 *
 *       {showAuth && (
 *         <AuthModal onClose={() => setShowAuth(false)} isFirstUser={false} />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * See README.md for full documentation.
 * ============================================================================
 */

// ============================================================================
// COMPONENTS
// ============================================================================
export {
  AuthModal,
  AuthCallback,
  ResetPassword,
  AccountSettings,
  GoogleIcon,
} from './components';

// ============================================================================
// HOOKS
// ============================================================================
export { useAuth } from './hooks';
export type { UseAuthReturn } from './hooks/useAuth';

// ============================================================================
// LIB (Supabase Client)
// ============================================================================
export {
  supabase,
  getAuthConfig,
  getRedirectUrl,
  needsEmailConfirmation,
  getUserRole,
  isUserAdmin,
} from './lib/supabase';

export {
  PRISMA_DOCS,
  SUPABASE_PRISMA_GUIDE,
} from './lib/prisma';

export type {
  PrismaUser,
  PrismaTaskList,
} from './lib/prisma';

// ============================================================================
// UTILS
// ============================================================================
export {
  createLogger,
  authLogger,
  dbLogger,
  apiLogger,
} from './utils/logger';

// ============================================================================
// TYPES
// ============================================================================
export type {
  // Auth State
  AuthState,
  AuthContextValue,

  // Auth Modes
  AuthMode,
  AuthCallbackState,
  AccountSettingsSection,
  AuthEventType,

  // Component Props
  AuthModalProps,
  AccountSettingsProps,
  AuthCallbackProps,

  // API Results
  AuthResult,
  SignUpResult,
  SignInResult,

  // User Types
  UserRole,
  UserMetadata,
  DbUser,
  DbTaskList,

  // Toast Types
  ToastType,
  ToastConfig,

  // Config
  AuthConfig,

  // Re-exports from Supabase
  User,
  Session,
} from './types';
