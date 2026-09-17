import React, { useState, useRef, useEffect } from 'react';
import {
  LogIn,
  LogOut,
  Database,
  CheckCircle2,
  FolderOpen,
  ChevronDown,
  ShieldCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface UserAuthButtonProps {
  onOpenSavedDatasets: () => void;
}

export const UserAuthButton: React.FC<UserAuthButtonProps> = ({ onOpenSavedDatasets }) => {
  const { user, isLoading, loginWithGoogle, logout, savedDatasets, dbSyncStatus } = useAuth();
  const { isDark } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await loginWithGoogle();
    } catch (error) {
      console.error('Sign-in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs text-slate-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="hidden sm:inline">Connecting...</span>
      </div>
    );
  }

  // Not logged in: Show Google Sign-in button
  if (!user) {
    return (
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isSigningIn}
        id="btn-google-login"
        title="Sign in with your Google account to store datasets in your secure database"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-xs transition-all cursor-pointer min-h-[38px] active:scale-98"
      >
        {isSigningIn ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Sign in with Google</span>
      </button>
    );
  }

  // Logged in: Profile avatar, sync pill, and dropdown
  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        id="btn-user-profile-menu"
        title={`Signed in as ${user.email}`}
        className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer min-h-[38px] ${
          isDark
            ? 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700'
            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
        }`}
      >
        {/* User avatar or fallback */}
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500 shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}

        <span className="hidden sm:inline font-semibold max-w-[120px] truncate text-left">
          {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
        </span>

        {/* Database Sync Status Icon */}
        <span
          className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
            dbSyncStatus === 'syncing'
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
          }`}
          title={
            dbSyncStatus === 'syncing'
              ? 'Syncing to your Firestore database...'
              : 'Connected to your secure user database'
          }
        >
          {dbSyncStatus === 'syncing' ? (
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          )}
          <span className="hidden lg:inline">{dbSyncStatus === 'syncing' ? 'Syncing' : 'DB'}</span>
        </span>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {/* User Dropdown Menu */}
      {dropdownOpen && (
        <div
          className={`absolute right-0 mt-2 w-72 rounded-xl shadow-xl border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {/* User Details */}
          <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs truncate">{user.displayName || 'Google Account'}</div>
                <div className="text-[11px] text-slate-400 truncate" title={user.email || ''}>
                  {user.email}
                </div>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Isolated Personal Firestore DB Active</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                onOpenSavedDatasets();
                setDropdownOpen(false);
              }}
              id="btn-menu-saved-datasets"
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-blue-500" />
                <span>My Saved Datasets</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                {savedDatasets.length}
              </span>
            </button>
          </div>

          {/* Sign Out */}
          <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={async () => {
                setDropdownOpen(false);
                await logout();
              }}
              id="btn-menu-logout"
              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
