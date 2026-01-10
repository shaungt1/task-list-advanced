/**
 * Modular Supabase Auth - ResetPassword Component
 *
 * Standalone page for setting a new password after clicking
 * the reset link from email.
 *
 * This component should be rendered at /reset-password route.
 *
 * @example
 * ```tsx
 * // In your router configuration:
 * import { ResetPassword } from '@/auth';
 *
 * <Route path="/reset-password" element={<ResetPassword />} />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { authLogger } from '../utils/logger';

// Import UI components - adjust path based on your project structure
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Lock, Loader2, CheckCircle2, XCircle, KeyRound, Home } from 'lucide-react';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for error in URL hash (e.g., expired link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorCode = hashParams.get('error_code');
    const errorDescription = hashParams.get('error_description');

    if (errorCode) {
      authLogger.error('Password reset error from URL', { errorCode, errorDescription });

      if (errorCode === 'otp_expired') {
        setError('Password reset link has expired. Please request a new one.');
        toast.error('Password reset link has expired', {
          description: 'Please request a new password reset.',
          duration: 6000,
        });
      } else {
        const decodedError = errorDescription?.replace(/\+/g, ' ') || 'An error occurred with the reset link.';
        setError(decodedError);
        toast.error(decodedError);
      }
      setCheckingSession(false);
      return;
    }

    // Check if user has a valid session from the reset link
    const checkSession = async () => {
      try {
        toast.info('Verifying reset link...', { duration: 2000 });

        // First try to get session from URL hash tokens
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          authLogger.info('Setting session from URL tokens for password reset');

          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            authLogger.error('Failed to set session from tokens', { error: sessionError.message });
            setError('Failed to verify reset link. Please try again.');
            toast.error('Failed to verify reset link', {
              description: 'Please request a new password reset.',
            });
            setCheckingSession(false);
            return;
          }

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

        if (getSessionError) {
          authLogger.error('Session check failed', { error: getSessionError.message });
          setError('Failed to verify reset link. Please try again.');
          toast.error('Failed to verify reset link');
          setCheckingSession(false);
          return;
        }

        if (session) {
          authLogger.info('Valid session found for password reset');
          setHasSession(true);
          toast.success('Reset link verified', {
            description: 'You can now set a new password.',
          });
        } else {
          authLogger.warn('No session found for password reset');
          setError('Invalid or expired reset link. Please request a new password reset.');
          toast.error('Invalid or expired reset link', {
            description: 'Please request a new password reset.',
          });
        }
      } catch (err) {
        authLogger.error('Unexpected error checking session', { error: err });
        setError('An unexpected error occurred. Please try again.');
        toast.error('An unexpected error occurred');
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.warning('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    toast.info('Updating password...', { duration: 2000 });

    try {
      authLogger.info('Attempting password update');

      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        authLogger.error('Password update failed', { error: updateError.message });
        setError(updateError.message);
        toast.error(`Password update failed: ${updateError.message}`);
        return;
      }

      authLogger.info('Password updated successfully');
      setSuccess(true);
      toast.success('Password updated successfully!', {
        description: 'You can now sign in with your new password.',
        duration: 5000,
      });

      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      authLogger.error('Unexpected error updating password', { error: errorMessage });
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50">
        <Card className="w-full max-w-md mx-4 border-violet-200 shadow-2xl shadow-violet-500/10">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
            <p className="text-muted-foreground">Verifying reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50">
        <Card className="w-full max-w-md mx-4 border-violet-200 shadow-2xl shadow-violet-500/10">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 p-3 rounded-full bg-green-100">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Password Updated!</CardTitle>
            <CardDescription>Your password has been successfully updated.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Redirecting to home page...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (no session)
  if (error && !hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50">
        <Card className="w-full max-w-md mx-4 border-violet-200 shadow-2xl shadow-violet-500/10">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 p-3 rounded-full bg-red-100">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Reset Link Error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home Page
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              You can request a new password reset from the sign in page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50">
      <Card className="w-full max-w-md mx-4 border-violet-200 shadow-2xl shadow-violet-500/10">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl">Set New Password</CardTitle>
          </div>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-medium"
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Update Password
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-violet-600 hover:text-violet-700 hover:bg-violet-50"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel and go to Home
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPassword;
