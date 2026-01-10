import React, { useState } from 'react';
import { X, ExternalLink, LogIn, LogOut, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { ChatHistory } from './ChatHistory';
import { ImportExamplesButton } from './admin/ImportExamplesButton';
import { AccountSettings, supabase } from '../auth';
import { User } from '@supabase/supabase-js';

interface SettingsModalProps {
  onClose: () => void;
  onSave: (settings: {
    service: string;
    model: string;
    googleApiKey: string;
    aiProvider: string;
    openaiApiKey: string;
    claudeApiKey: string;
    grokApiKey: string;
  }) => void;
  initialSettings: {
    service: string;
    model: string;
    googleApiKey: string;
    aiProvider: string;
    openaiApiKey: string;
    claudeApiKey: string;
    grokApiKey: string;
  };
  isAdmin?: boolean;
  user: User | null;
  onShowAuth: () => void;
}

export function SettingsModal({ onClose, onSave, initialSettings, isAdmin, user, onShowAuth }: SettingsModalProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [clearing, setClearing] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const clearSiteData = async () => {
    setClearing(true);
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });
      const databases = await window.indexedDB.databases();
      databases.forEach(db => {
        if (db.name) window.indexedDB.deleteDatabase(db.name);
      });
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }
      window.location.reload();
    } catch (error) {
      console.error('Error clearing site data:', error);
    } finally {
      setClearing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            {/* Authentication Section */}
            <div className="mb-6 pb-6 border-b">
              {user ? (
                <div>
                  <button
                    onClick={() => setShowAccountSettings(!showAccountSettings)}
                    className="w-full flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Settings2 size={16} className="text-violet-600" />
                      <h4 className="text-sm font-medium text-gray-900">Account Settings</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</span>
                      {showAccountSettings ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {showAccountSettings && (
                    <div className="mt-4 pt-4 border-t">
                      <AccountSettings
                        user={user}
                        onClose={onClose}
                        isAdmin={isAdmin}
                      />
                    </div>
                  )}

                  {!showAccountSettings && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Account</h4>
                  <button
                    onClick={onShowAuth}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-md hover:from-violet-700 hover:to-fuchsia-700 transition-colors"
                  >
                    <LogIn size={16} />
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* AI Provider Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Provider
              </label>
              <select
                value={settings.aiProvider || 'gemini'}
                onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="claude">Anthropic Claude</option>
                <option value="grok">xAI Grok</option>
              </select>
            </div>

            {/* Conditional API Key Inputs */}
            {settings.aiProvider === 'openai' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={settings.openaiApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-md"
                    placeholder="Enter your OpenAI API key"
                  />
                  <button
                    onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                    className="modern-button bg-yellow-100 text-yellow-700 hover:bg-yellow-200 whitespace-nowrap w-fit flex items-center gap-1"
                    title="Get OpenAI API Key"
                  >
                    Get API Key
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ) : settings.aiProvider === 'claude' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anthropic Claude API Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={settings.claudeApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, claudeApiKey: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-md"
                    placeholder="Enter your Claude API key"
                  />
                  <button
                    onClick={() => window.open('https://console.anthropic.com/settings/keys', '_blank')}
                    className="modern-button bg-yellow-100 text-yellow-700 hover:bg-yellow-200 whitespace-nowrap w-fit flex items-center gap-1"
                    title="Get Claude API Key"
                  >
                    Get API Key
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ) : settings.aiProvider === 'grok' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  xAI Grok API Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={settings.grokApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, grokApiKey: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-md"
                    placeholder="Enter your Grok API key"
                  />
                  <button
                    onClick={() => window.open('https://console.x.ai/', '_blank')}
                    className="modern-button bg-yellow-100 text-yellow-700 hover:bg-yellow-200 whitespace-nowrap w-fit flex items-center gap-1"
                    title="Get Grok API Key"
                  >
                    Get API Key
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google API Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={settings.googleApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, googleApiKey: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-md"
                    placeholder="Enter your Google API key"
                  />
                  <button
                    onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
                    className="modern-button bg-yellow-100 text-yellow-700 hover:bg-yellow-200 whitespace-nowrap w-fit flex items-center gap-1"
                    title="Get Google API Key"
                  >
                    Get API Key
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Admin Section */}
            {isAdmin && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Admin Tools</h4>
                  <div className="text-xs text-gray-500">Admin Access</div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Example Lists</h5>
                    <p className="text-xs text-gray-600 mb-3">
                      Import example task lists into the database. These lists will be available to all users.
                    </p>
                    <ImportExamplesButton
                      onSuccess={() => {
                        alert('Example lists imported successfully!');
                      }}
                      onError={(error) => {
                        alert(error);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Clear Site Data Section */}
            <div className="mt-8 pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Clear Site Data</h4>
              <p className="text-sm text-gray-500 mb-4">
                This will clear all saved settings, tasks, and cached data. This action cannot be undone.
              </p>
              <button
                onClick={clearSiteData}
                disabled={clearing}
                className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                {clearing ? 'Clearing...' : 'Clear All Data'}
              </button>
            </div>

            <ChatHistory onClose={onClose} />
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={() => onSave(settings)}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}