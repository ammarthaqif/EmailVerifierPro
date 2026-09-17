import React from 'react';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  FolderOpen,
  CloudUpload,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface CloudDatabaseSyncBarProps {
  fileName: string;
  totalRecords: number;
  onOpenSavedDatasets: () => void;
  onSyncNow: () => void;
}

export const CloudDatabaseSyncBar: React.FC<CloudDatabaseSyncBarProps> = ({
  fileName,
  totalRecords,
  onOpenSavedDatasets,
  onSyncNow,
}) => {
  const { user, loginWithGoogle, dbSyncStatus, isSavingToDb, lastSavedAt, savedDatasets } =
    useAuth();
  const { isDark, themeConfig } = useTheme();

  // If user is not logged in, show call-to-action to authenticate with Gmail
  if (!user) {
    return (
      <div
        className={`mb-5 p-4 rounded-xl border transition-all ${
          isDark
            ? 'bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border-blue-800/40 text-slate-200'
            : 'bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 border-blue-200 text-slate-800 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Store Extracted Data in Your Personal Database</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  <ShieldCheck className="w-3 h-3" />
                  Isolated Firestore DB
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Log in with your Gmail account to permanently protect and store "{fileName}" ({totalRecords} contacts)
                with all verification scores and outreach progress.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            id="btn-syncbar-google-login"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-xs transition-all shrink-0 cursor-pointer active:scale-98"
          >
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
            <span>Log in with Gmail</span>
          </button>
        </div>
      </div>
    );
  }

  // User is logged in: Show personal database status and sync button
  return (
    <div
      className={`mb-5 p-3 rounded-xl border transition-all ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Personal Cloud Database</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate max-w-[200px]">
                {user.email}
              </span>

              {dbSyncStatus === 'syncing' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Syncing records...
                </span>
              ) : dbSyncStatus === 'saved' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Synced to Cloud DB {lastSavedAt && `(${lastSavedAt})`}
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Isolated per-user security active. Your dataset is stored exclusively in your own Firestore collection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={onOpenSavedDatasets}
            id="btn-syncbar-saved-datasets"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Saved Datasets ({savedDatasets.length})</span>
          </button>

          <button
            type="button"
            onClick={onSyncNow}
            disabled={isSavingToDb}
            id="btn-syncbar-save-now"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSavingToDb ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CloudUpload className="w-3.5 h-3.5" />
            )}
            <span>{isSavingToDb ? 'Saving...' : 'Sync to Cloud DB'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
