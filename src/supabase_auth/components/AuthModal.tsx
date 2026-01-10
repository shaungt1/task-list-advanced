/**
 * Modular Supabase Auth - AuthModal Component
 *
 * Main authentication modal supporting:
 * - Email/password sign in and sign up
 * - Google OAuth
 * - Magic link sign in
 * - Password reset request
 *
 * All actions include toast notifications for:
 * - Success states
 * - Warning states (e.g., email not verified)
 * - Error states
 *
 * @example
 * ```tsx
 * import { AuthModal } from '@/auth';
 *
 * function App() {
 *   const [showAuth, setShowAuth] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setShowAuth(true)}>Sign In</button>
 *       {showAuth && (
 *         <AuthModal
 *           onClose={() => setShowAuth(false)}
 *           isFirstUser={false}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Sparkles, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, getRedirectUrl, needsEmailConfirmation } from '../lib/supabase';
import { authLogger } from '../utils/logger';
import { GoogleIcon } from './GoogleIcon';
import type { AuthModalProps, AuthMode } from '../types';

// Import UI components - adjust path based on your project structure
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';

export function AuthModal({ onClose, isFirstUser }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>(isFirstUser ? 'signup' : 'signin');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  // ---------------------------------------------------------------------------
  // Google OAuth Sign In
  // ---------------------------------------------------------------------------
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    authLogger.info('Google sign-in initiated');
    toast.info('Redirecting to Google...', { duration: 2000 });

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl('/auth/callback'),
        },
      });

      if (oauthError) {
        authLogger.error('Google sign-in failed', { error: oauthError.message });
        setError(oauthError.message);
        toast.error(`Google sign-in failed: ${oauthError.message}`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      authLogger.error('Google sign-in unexpected error', { error: errorMessage });
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Magic Link Sign In
  // ---------------------------------------------------------------------------
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    authLogger.info('Magic link requested', { email: email.trim() });
    toast.info('Sending magic link...', { duration: 2000 });

    try {
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: getRedirectUrl('/auth/callback'),
        },
      });

      if (magicLinkError) {
        authLogger.error('Magic link failed', { error: magicLinkError.message });
        setError(magicLinkError.message);
        toast.error(`Magic link failed: ${magicLinkError.message}`);
        return;
      }

      authLogger.info('Magic link sent', { email: email.trim() });
      setSuccess('Magic link sent! Check your email inbox.');
      toast.success('Magic link sent! Check your email inbox.', {
        duration: 6000,
        description: 'Click the link in the email to sign in.',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      authLogger.error('Magic link unexpected error', { error: errorMessage });
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Password Reset Request
  // ---------------------------------------------------------------------------
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    authLogger.info('Password reset requested', { email: email.trim() });
    toast.info('Sending reset link...', { duration: 2000 });

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: getRedirectUrl('/reset-password'),
        }
      );

      if (resetError) {
        authLogger.error('Password reset failed', { error: resetError.message });
        setError(resetError.message);
        toast.error(`Password reset failed: ${resetError.message}`);
        return;
      }

      authLogger.info('Password reset email sent', { email: email.trim() });
      setSuccess('Password reset email sent! Check your inbox.');
      toast.success('Password reset email sent!', {
        duration: 6000,
        description: 'Click the link in the email to reset your password.',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      authLogger.error('Password reset unexpected error', { error: errorMessage });
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Email/Password Sign In / Sign Up
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      toast.error('Please enter both email and password');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.warning('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        // -------------------------
        // SIGN UP
        // -------------------------
        authLogger.info('Sign up attempt', { email: email.trim(), isFirstUser });
        toast.info('Creating your account...', { duration: 2000 });

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: isFirstUser ? { role: 'admin' } : undefined,
            emailRedirectTo: getRedirectUrl('/auth/callback'),
          }
        });

        if (signUpError) {
          authLogger.error('Sign up failed', { error: signUpError.message, code: signUpError.status });

          if (signUpError.message.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
            toast.warning('Email already registered', {
              description: 'Try signing in instead.',
              duration: 5000,
            });
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

        // Check if email verification is required
        if (needsEmailConfirmation(data.user)) {
          authLogger.info('Sign up successful - email verification required', {
            userId: data.user.id,
            email: data.user.email
          });
          setSuccess('Account created! Please check your email to verify your account.');
          toast.success('Account created!', {
            duration: 8000,
            description: 'Please check your email to verify your account before signing in.',
          });
          setMode('signin');
          return;
        }

        authLogger.info('Sign up successful', {
          userId: data.user.id,
          email: data.user.email,
          role: isFirstUser ? 'admin' : 'user'
        });

        toast.success(
          isFirstUser
            ? 'Admin account created successfully!'
            : 'Account created successfully!',
          { duration: 5000 }
        );
        onClose();

      } else {
        // -------------------------
        // SIGN IN
        // -------------------------
        authLogger.info('Sign in attempt', { email: email.trim() });
        toast.info('Signing in...', { duration: 2000 });

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });

        if (signInError) {
          authLogger.error('Sign in failed', { error: signInError.message, code: signInError.status });

          if (signInError.message.includes('Email not confirmed')) {
            setError('Please verify your email before signing in.');
            toast.warning('Email not verified', {
              duration: 6000,
              description: 'Please check your inbox and click the verification link.',
            });
          } else if (signInError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password.');
            toast.error('Invalid email or password');
          } else {
            setError(signInError.message);
            toast.error(`Sign in failed: ${signInError.message}`);
          }
          return;
        }

        authLogger.info('Sign in successful', {
          userId: data.user?.id,
          email: data.user?.email
        });
        toast.success('Signed in successfully!', {
          description: `Welcome back, ${data.user?.email}!`,
        });
        onClose();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      authLogger.error('Auth unexpected error', { error: errorMessage });
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Mode Switching
  // ---------------------------------------------------------------------------
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
  };

  const getTitle = () => {
    if (isFirstUser) return 'Create Admin Account';
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'signin': return 'Welcome Back';
      case 'forgot-password': return 'Reset Password';
      case 'magic-link': return 'Sign in with Magic Link';
      default: return 'Sign In';
    }
  };

  const getDescription = () => {
    if (isFirstUser) return 'You are the first user. This account will have admin privileges.';
    switch (mode) {
      case 'signup': return 'Create a new account to get started';
      case 'signin': return 'Sign in to your account';
      case 'forgot-password': return 'Enter your email to receive a reset link';
      case 'magic-link': return 'Enter your email to receive a sign-in link';
      default: return '';
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 border-violet-200 shadow-2xl shadow-violet-500/10">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-xl">{getTitle()}</CardTitle>
            </div>
            {!isFirstUser && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google SSO Button */}
          {(mode === 'signin' || mode === 'signup') && !isFirstUser && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 gap-3 font-medium"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
            </>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Magic Link Form */}
          {mode === 'magic-link' && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    ref={inputRef}
                    id="magic-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-medium"
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Send Magic Link
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                onClick={() => switchMode('signin')}
              >
                Back to sign in
              </Button>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot-password' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    ref={inputRef}
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-medium"
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                onClick={() => switchMode('signin')}
              >
                Back to sign in
              </Button>
            </form>
          )}

          {/* Sign In / Sign Up Form */}
          {(mode === 'signin' || mode === 'signup') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    ref={inputRef}
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                    required
                    minLength={6}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    disabled={loading}
                  />
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                )}
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Confirm your password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-medium"
                disabled={loading || !email.trim() || !password.trim() || (mode === 'signup' && !confirmPassword.trim())}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    {isFirstUser ? 'Create Admin Account' : (mode === 'signup' ? 'Create Account' : 'Sign In')}
                  </>
                )}
              </Button>

              {/* Mode Switch Links */}
              {!isFirstUser && (
                <div className="space-y-2 pt-2">
                  {mode === 'signin' && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-violet-600 hover:text-violet-700"
                          onClick={() => switchMode('forgot-password')}
                        >
                          Forgot password?
                        </Button>
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-violet-600 hover:text-violet-700"
                          onClick={() => switchMode('magic-link')}
                        >
                          <KeyRound className="w-3 h-3 mr-1" />
                          Magic Link
                        </Button>
                      </div>
                      <Separator />
                      <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-violet-600 hover:text-violet-700 font-semibold"
                          onClick={() => switchMode('signup')}
                        >
                          Sign up
                        </Button>
                      </p>
                    </>
                  )}
                  {mode === 'signup' && (
                    <>
                      <Separator />
                      <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-violet-600 hover:text-violet-700 font-semibold"
                          onClick={() => switchMode('signin')}
                        >
                          Sign in
                        </Button>
                      </p>
                    </>
                  )}
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthModal;
