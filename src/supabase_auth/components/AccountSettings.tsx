/**
 * Modular Supabase Auth - AccountSettings Component
 *
 * Account management panel for authenticated users.
 * Supports:
 * - Change password
 * - Change email
 * - Sign out all devices
 * - Delete account
 *
 * All actions include toast notifications for success/warning/error states.
 *
 * @example
 * ```tsx
 * import { AccountSettings } from '@/auth';
 *
 * function SettingsPage({ user, isAdmin }) {
 *   return (
 *     <AccountSettings
 *       user={user}
 *       onClose={() => {}}
 *       isAdmin={isAdmin}
 *     />
 *   );
 * }
 * ```
 */

import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { authLogger } from '../utils/logger';
import type { AccountSettingsProps, AccountSettingsSection } from '../types';

// Import UI components - adjust path based on your project structure
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import {
  Lock,
  Mail,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  KeyRound,
  MonitorSmartphone,
} from 'lucide-react';

export function AccountSettings({ user, onClose, isAdmin }: AccountSettingsProps) {
  const [activeSection, setActiveSection] = useState<AccountSettingsSection>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Change Email State
  const [newEmail, setNewEmail] = useState('');

  // Delete Account State
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const resetState = () => {
    setError(null);
    setSuccess(null);
    setNewPassword('');
    setConfirmNewPassword('');
    setNewEmail('');
    setDeleteConfirmation('');
  };

  // ---------------------------------------------------------------------------
  // Change Password
  // ---------------------------------------------------------------------------
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      toast.warning('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    toast.info('Updating password...', { duration: 2000 });

    try {
      authLogger.info('Changing password', { userId: user.id });

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        authLogger.error('Password change failed', { error: updateError.message });
        setError(updateError.message);
        toast.error(`Password change failed: ${updateError.message}`);
        return;
      }

      authLogger.info('Password changed successfully', { userId: user.id });
      setSuccess('Password changed successfully!');
      toast.success('Password changed successfully!', {
        description: 'Your new password is now active.',
      });
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setActiveSection(null), 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      authLogger.error('Unexpected error changing password', { error: errorMessage });
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Change Email
  // ---------------------------------------------------------------------------
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail.trim() || !newEmail.includes('@')) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }

    if (newEmail.toLowerCase() === user.email?.toLowerCase()) {
      setError('New email must be different from current email');
      toast.warning('New email must be different from current email');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    toast.info('Sending verification email...', { duration: 2000 });

    try {
      authLogger.info('Changing email', { userId: user.id, newEmail });

      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail.trim(),
      });

      if (updateError) {
        authLogger.error('Email change failed', { error: updateError.message });
        setError(updateError.message);
        toast.error(`Email change failed: ${updateError.message}`);
        return;
      }

      authLogger.info('Email change initiated', { userId: user.id, newEmail });
      setSuccess('Verification email sent to your new address. Please check your inbox.');
      toast.success('Verification email sent!', {
        description: 'Check your new email inbox and click the verification link.',
        duration: 6000,
      });
      setNewEmail('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      authLogger.error('Unexpected error changing email', { error: errorMessage });
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Sign Out All Devices
  // ---------------------------------------------------------------------------
  const handleSignOutAllDevices = async () => {
    setLoading(true);
    setError(null);
    toast.info('Signing out all devices...', { duration: 2000 });

    try {
      authLogger.info('Signing out all devices', { userId: user.id });

      const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });

      if (signOutError) {
        authLogger.error('Sign out all devices failed', { error: signOutError.message });
        setError(signOutError.message);
        toast.error(`Sign out failed: ${signOutError.message}`);
        return;
      }

      authLogger.info('Signed out all devices', { userId: user.id });
      toast.success('Signed out from all devices', {
        description: 'All your sessions have been terminated.',
      });
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      authLogger.error('Unexpected error signing out all devices', { error: errorMessage });
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Delete Account
  // ---------------------------------------------------------------------------
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteConfirmation !== 'DELETE') {
      setError('Please type DELETE to confirm');
      toast.error('Please type DELETE to confirm account deletion');
      return;
    }

    setLoading(true);
    setError(null);
    toast.warning('Deleting your account...', { duration: 3000 });

    try {
      authLogger.info('Deleting account', { userId: user.id });

      // First, delete user data from the users table
      const { error: deleteDataError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteDataError) {
        authLogger.error('Failed to delete user data', { error: deleteDataError.message });
        // Continue anyway - the auth deletion is more important
        toast.warning('Some user data could not be deleted', { duration: 3000 });
      }

      // Delete any task lists owned by this user
      const { error: deleteListsError } = await supabase
        .from('task_lists')
        .delete()
        .eq('user_id', user.id);

      if (deleteListsError) {
        authLogger.warn('Failed to delete user task lists', { error: deleteListsError.message });
        // Continue anyway
      }

      // Sign out the user globally
      await supabase.auth.signOut({ scope: 'global' });

      authLogger.info('Account deletion completed', { userId: user.id });
      toast.success('Account deleted successfully', {
        description: 'Your account and data have been removed.',
        duration: 5000,
      });
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      authLogger.error('Unexpected error deleting account', { error: errorMessage });
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* User Info Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
            <p className="text-xs text-gray-500">
              {isAdmin && (
                <span className="inline-flex items-center gap-1 text-violet-600">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
              {!isAdmin && 'Standard User'}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {error && activeSection === null && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons (when no section is active) */}
      {activeSection === null && (
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10"
            onClick={() => { resetState(); setActiveSection('password'); }}
          >
            <KeyRound className="w-4 h-4 text-violet-600" />
            Change Password
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10"
            onClick={() => { resetState(); setActiveSection('email'); }}
          >
            <Mail className="w-4 h-4 text-violet-600" />
            Change Email
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10"
            onClick={handleSignOutAllDevices}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MonitorSmartphone className="w-4 h-4 text-orange-600" />
            )}
            Sign Out All Devices
          </Button>

          <Separator className="my-3" />

          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={() => { resetState(); setActiveSection('delete'); }}
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </div>
      )}

      {/* Change Password Form */}
      {activeSection === 'password' && (
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="w-4 h-4 text-violet-600" />
            <h4 className="font-medium text-sm">Change Password</h4>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10"
                placeholder="Enter new password"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="pl-10"
                placeholder="Confirm new password"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { resetState(); setActiveSection(null); }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
              disabled={loading || !newPassword || !confirmNewPassword}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
            </Button>
          </div>
        </form>
      )}

      {/* Change Email Form */}
      {activeSection === 'email' && (
        <form onSubmit={handleChangeEmail} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-violet-600" />
            <h4 className="font-medium text-sm">Change Email</h4>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              A verification email will be sent to your new address. You must click the link to confirm the change.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentEmail">Current Email</Label>
            <Input
              id="currentEmail"
              type="email"
              value={user.email || ''}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="pl-10"
                placeholder="Enter new email"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { resetState(); setActiveSection(null); }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
              disabled={loading || !newEmail.trim()}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Verification'}
            </Button>
          </div>
        </form>
      )}

      {/* Delete Account Form */}
      {activeSection === 'delete' && (
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-4 h-4 text-red-600" />
            <h4 className="font-medium text-sm text-red-600">Delete Account</h4>
          </div>

          <Alert variant="destructive" className="border-red-300 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action is permanent and cannot be undone. All your data will be deleted.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="deleteConfirmation">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm
            </Label>
            <Input
              id="deleteConfirmation"
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE"
              required
              disabled={loading}
              className="border-red-200 focus:border-red-400"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { resetState(); setActiveSection(null); }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="flex-1"
              disabled={loading || deleteConfirmation !== 'DELETE'}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete My Account'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AccountSettings;
