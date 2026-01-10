/**
 * Modular Supabase Auth - AuthCallback Component
 *
 * Handles authentication callbacks from:
 * - Magic link sign in
 * - Google OAuth
 * - Email verification
 * - Password recovery redirect
 *
 * This component should be rendered at /auth/callback route.
 *
 * @example
 * ```tsx
 * // In your router configuration:
 * import { AuthCallback } from '@/auth';
 *
 * <Route path="/auth/callback" element={<AuthCallback />} />
 * ```
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { authLogger } from '../utils/logger';
import type { AuthCallbackState } from '../types';

// Import UI components - adjust path based on your project structure
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export function AuthCallback() {
  const [state, setState] = useState<AuthCallbackState>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        authLogger.info('Auth callback initiated');
        toast.info('Processing authentication...', { duration: 2000 });

        // Check for error in URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorCode = hashParams.get('error_code');
        const errorDescription = hashParams.get('error_description');

        if (errorCode) {
          authLogger.error('Auth callback error from URL', { errorCode, errorDescription });
          const decodedError = errorDescription?.replace(/\+/g, ' ') || 'Authentication failed';
          setState('error');
          setErrorMessage(decodedError);
          toast.error(decodedError);
          return;
        }

        // Check for access token in hash (magic link, OAuth)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken) {
          authLogger.info('Access token found in URL hash', { type });

          // Set the session from the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            authLogger.error('Failed to set session from tokens', { error: error.message });
            setState('error');
            setErrorMessage(error.message);
            toast.error(`Authentication failed: ${error.message}`);
            return;
          }

          if (data.session) {
            authLogger.info('Session established from callback', {
              userId: data.session.user.id,
              email: data.session.user.email,
              type,
            });

            // Handle password recovery - redirect to reset password page
            if (type === 'recovery') {
              setMessage('Password recovery verified. Redirecting...');
              toast.success('Password recovery verified!', {
                description: 'You can now set a new password.',
              });
              setTimeout(() => navigate('/reset-password'), 1500);
              return;
            }

            // Handle email change confirmation
            if (type === 'email_change') {
              setState('success');
              setMessage('Email updated successfully!');
              toast.success('Email updated successfully!');
              setTimeout(() => {
                window.history.replaceState({}, document.title, window.location.pathname);
                navigate('/');
              }, 1500);
              return;
            }

            setState('success');
            setMessage('Successfully signed in!');
            toast.success('Successfully signed in!', {
              description: `Welcome, ${data.session.user.email}!`,
            });

            // Clean up URL and redirect
            setTimeout(() => {
              window.history.replaceState({}, document.title, window.location.pathname);
              navigate('/');
            }, 1500);
            return;
          }
        }

        // Check for query params (email confirmation, etc.)
        const urlParams = new URLSearchParams(window.location.search);
        const urlType = urlParams.get('type');
        const tokenHash = urlParams.get('token_hash');

        if (tokenHash && urlType) {
          authLogger.info('Token hash found in URL params', { type: urlType });
          toast.info('Verifying your email...', { duration: 2000 });

          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: urlType as 'signup' | 'magiclink' | 'recovery' | 'email_change',
          });

          if (error) {
            authLogger.error('OTP verification failed', { error: error.message });
            setState('error');
            setErrorMessage(error.message);
            toast.error(`Verification failed: ${error.message}`);
            return;
          }

          if (data.session) {
            authLogger.info('OTP verified successfully', {
              userId: data.session.user.id,
              type: urlType,
            });

            setState('success');

            if (urlType === 'signup') {
              setMessage('Email verified successfully!');
              toast.success('Email verified successfully!', {
                description: 'Your account is now active.',
                duration: 5000,
              });
            } else {
              setMessage('Successfully signed in!');
              toast.success('Successfully signed in!');
            }

            setTimeout(() => navigate('/'), 1500);
            return;
          }
        }

        // Try to get existing session (might have been set automatically)
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          authLogger.info('Existing session found', { userId: session.user.id });
          setState('success');
          setMessage('Already signed in!');
          toast.info('You are already signed in');
          setTimeout(() => navigate('/'), 1500);
          return;
        }

        // No valid auth data found
        authLogger.warn('No valid auth data in callback');
        setState('error');
        setErrorMessage('No authentication data found. Please try signing in again.');
        toast.error('No authentication data found', {
          description: 'Please try signing in again.',
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        authLogger.error('Unexpected error in auth callback', { error: errorMessage });
        setState('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
        toast.error('An unexpected error occurred. Please try again.');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50">
      <Card className="w-full max-w-md mx-4 border-violet-200 shadow-2xl shadow-violet-500/10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">
            {state === 'loading' && 'Authenticating...'}
            {state === 'success' && 'Success!'}
            {state === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription>
            {state === 'loading' && 'Please wait while we verify your credentials'}
            {state === 'success' && 'You have been authenticated successfully'}
            {state === 'error' && 'There was a problem with your authentication'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-4 pt-4">
          {state === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}

          {state === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-sm text-green-700 font-medium">{message}</p>
              <p className="text-xs text-muted-foreground">Redirecting you now...</p>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="p-3 rounded-full bg-red-100">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <p className="text-sm text-red-700 text-center">{errorMessage}</p>
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
              >
                Go to Home Page
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                You can try signing in again from the home page.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthCallback;
