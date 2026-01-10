/**
 * Modular Supabase Auth - useAuth Hook
 *
 * React hook for managing authentication state.
 * Provides user info, loading state, admin status, and auth methods.
 *
 * @example
 * ```tsx
 * import { useAuth } from '@/auth';
 *
 * function MyComponent() {
 *   const { user, loading, isAdmin, signOut } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Please sign in</div>;
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user.email}</p>
 *       {isAdmin && <p>You have admin privileges</p>}
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase, isUserAdmin } from '../lib/supabase';
import { authLogger } from '../utils/logger';
import type { AuthState } from '../types';

// ============================================================================
// Hook Interface
// ============================================================================

export interface UseAuthReturn extends AuthState {
  signOut: () => Promise<void>;
  signOutAllDevices: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// ============================================================================
// useAuth Hook
// ============================================================================

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // ---------------------------------------------------------------------------
  // Update state from session
  // ---------------------------------------------------------------------------
  const updateFromSession = useCallback((currentSession: Session | null) => {
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);
    setSession(currentSession);
    setIsAdmin(isUserAdmin(currentUser));
    setLoading(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Initialize and subscribe to auth changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      authLogger.debug('Initial session retrieved', {
        hasSession: !!initialSession,
        userId: initialSession?.user?.id,
      });
      updateFromSession(initialSession);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, currentSession: Session | null) => {
        authLogger.info('Auth state changed', { event, userId: currentSession?.user?.id });

        updateFromSession(currentSession);

        // Show toast notifications for auth events
        switch (event) {
          case 'SIGNED_IN':
            // Don't show toast here - let the auth forms handle it
            break;
          case 'SIGNED_OUT':
            toast.info('You have been signed out');
            break;
          case 'TOKEN_REFRESHED':
            authLogger.debug('Token refreshed successfully');
            break;
          case 'USER_UPDATED':
            toast.success('Account updated successfully');
            break;
          case 'PASSWORD_RECOVERY':
            authLogger.info('Password recovery initiated');
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [updateFromSession]);

  // ---------------------------------------------------------------------------
  // Sign out (current device)
  // ---------------------------------------------------------------------------
  const signOut = useCallback(async () => {
    try {
      authLogger.info('Signing out user', { userId: user?.id });

      const { error } = await supabase.auth.signOut();

      if (error) {
        authLogger.error('Sign out failed', { error: error.message });
        toast.error(`Sign out failed: ${error.message}`);
        throw error;
      }

      setUser(null);
      setSession(null);
      setIsAdmin(false);

      authLogger.info('User signed out successfully');
      // Toast handled by onAuthStateChange
    } catch (err) {
      authLogger.error('Unexpected error during sign out', { error: err });
      toast.error('An unexpected error occurred while signing out');
    }
  }, [user?.id]);

  // ---------------------------------------------------------------------------
  // Sign out all devices
  // ---------------------------------------------------------------------------
  const signOutAllDevices = useCallback(async () => {
    try {
      authLogger.info('Signing out all devices', { userId: user?.id });

      const { error } = await supabase.auth.signOut({ scope: 'global' });

      if (error) {
        authLogger.error('Sign out all devices failed', { error: error.message });
        toast.error(`Sign out failed: ${error.message}`);
        throw error;
      }

      setUser(null);
      setSession(null);
      setIsAdmin(false);

      authLogger.info('User signed out from all devices');
      toast.success('Signed out from all devices');
    } catch (err) {
      authLogger.error('Unexpected error during global sign out', { error: err });
      toast.error('An unexpected error occurred while signing out');
    }
  }, [user?.id]);

  // ---------------------------------------------------------------------------
  // Refresh session manually
  // ---------------------------------------------------------------------------
  const refreshSession = useCallback(async () => {
    try {
      authLogger.debug('Manually refreshing session');

      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        authLogger.error('Session refresh failed', { error: error.message });
        toast.error('Failed to refresh session');
        throw error;
      }

      updateFromSession(data.session);
      authLogger.info('Session refreshed successfully');
    } catch (err) {
      authLogger.error('Unexpected error refreshing session', { error: err });
    }
  }, [updateFromSession]);

  // ---------------------------------------------------------------------------
  // Return hook value
  // ---------------------------------------------------------------------------
  return {
    user,
    session,
    loading,
    isAdmin,
    signOut,
    signOutAllDevices,
    refreshSession,
  };
}

export default useAuth;
