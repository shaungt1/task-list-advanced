import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { authLogger } from '../../utils/logger';

interface AuthModalProps {
  onClose: () => void;
  isFirstUser: boolean;
}

export function AuthModal({ onClose, isFirstUser }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(isFirstUser);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus email input when modal opens
    inputRef.current?.focus();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    authLogger.info('Password reset requested', { email: email.trim() });

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        authLogger.error('Password reset failed', { error: resetError.message });
        setError(resetError.message);
        toast.error(`Password reset failed: ${resetError.message}`);
        return;
      }

      authLogger.info('Password reset email sent', { email: email.trim() });
      toast.success('Password reset email sent! Check your inbox.');
      setResetEmailSent(true);
    } catch (err: any) {
      authLogger.error('Password reset unexpected error', { error: err });
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Sign up
        authLogger.info('Sign up attempt', { email: email.trim(), isFirstUser });

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: isFirstUser ? { role: 'admin' } : undefined
          }
        });

        if (signUpError) {
          authLogger.error('Sign up failed', { error: signUpError.message, code: signUpError.status });
          if (signUpError.message.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
            toast.error('Email already registered. Please sign in instead.');
          } else {
            setError(signUpError.message);
            toast.error(`Sign up failed: ${signUpError.message}`);
          }
          return;
        }

        if (!data.user) {
          authLogger.error('Sign up failed - no user returned');
          setError('Failed to create account. Please try again.');
          toast.error('Failed to create account. Please try again.');
          return;
        }

        // Check if email confirmation is required
        // When email verification is enabled, identities will be empty until confirmed
        const needsEmailVerification = data.user.identities?.length === 0 ||
          (data.session === null && data.user.email_confirmed_at === null);

        if (needsEmailVerification) {
          authLogger.info('Sign up successful - email verification required', {
            userId: data.user.id,
            email: data.user.email
          });

          toast.info(
            'Account created! Please check your email to verify your account before signing in.',
            { duration: 8000 }
          );

          setError('Please check your email to verify your account. Then you can sign in.');
          setIsSignUp(false); // Switch to sign-in mode
          return;
        }

        // Success - no email verification needed!
        authLogger.info('Sign up successful', {
          userId: data.user.id,
          email: data.user.email,
          role: isFirstUser ? 'admin' : 'user'
        });

        toast.success(
          isFirstUser
            ? 'Admin account created successfully! You are now logged in.'
            : 'Account created successfully! You are now logged in.',
          { duration: 5000 }
        );

      } else {
        // Sign in
        authLogger.info('Sign in attempt', { email: email.trim() });

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });

        if (signInError) {
          authLogger.error('Sign in failed', { error: signInError.message, code: signInError.status });

          if (signInError.message.includes('Email not confirmed')) {
            setError('Please verify your email before signing in. Check your inbox for the verification link.');
            toast.warning('Email not verified. Please check your inbox for the verification link.', { duration: 6000 });
          } else if (signInError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
            toast.error('Invalid email or password. Please try again.');
          } else {
            setError(signInError.message);
            toast.error(`Sign in failed: ${signInError.message}`);
          }
          return;
        }

        // Success!
        authLogger.info('Sign in successful', {
          userId: data.user?.id,
          email: data.user?.email
        });
        toast.success('Signed in successfully!');
      }

      onClose();
    } catch (err: any) {
      authLogger.error('Auth unexpected error', { error: err });
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isFirstUser ? 'Create Admin Account' : (isForgotPassword ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Sign In'))}
          </h2>
          {!isFirstUser && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {isFirstUser && (
          <p className="mb-4 text-sm text-gray-600">
            You are the first user. This account will have admin privileges.
          </p>
        )}

        {isForgotPassword && resetEmailSent ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                Password reset email sent! Check your inbox for instructions to reset your password.
              </p>
            </div>
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setResetEmailSent(false);
                setEmail('');
                setError(null);
              }}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={isForgotPassword ? handlePasswordReset : handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              ref={inputRef}
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              required
              autoComplete="email"
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          {!isForgotPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                disabled={loading}
                placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
              />
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!isFirstUser && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setIsForgotPassword(false);
                  setError(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 text-left"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
              {!isSignUp && !isForgotPassword && (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setPassword('');
                    setError(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 text-left"
                >
                  Forgot password?
                </button>
              )}
              {isForgotPassword && (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 text-left"
                >
                  Back to sign in
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
            disabled={loading || !email.trim() || (!isForgotPassword && !password.trim())}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isForgotPassword ? 'Sending Reset Link...' : (isFirstUser ? 'Creating Account...' : (isSignUp ? 'Creating Account...' : 'Signing In...'))}
              </span>
            ) : (
              isForgotPassword ? 'Send Reset Link' : (isFirstUser ? 'Create Account' : (isSignUp ? 'Sign Up' : 'Sign In'))
            )}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}