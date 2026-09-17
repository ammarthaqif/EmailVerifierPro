import React, { useState } from 'react';
import {
  X,
  Database,
  FileSpreadsheet,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Mail,
  Loader2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SavedDatasetMeta, getDatasetRecords } from '../lib/firebase';
import { EmailRecord } from '../types';

interface SavedDatasetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDataset: (meta: SavedDatasetMeta, records: EmailRecord[]) => void;
  currentDatasetId?: string;
}

export const SavedDatasetsModal: React.FC<SavedDatasetsModalProps> = ({
  isOpen,
  onClose,
  onLoadDataset,
  currentDatasetId,
}) => {
  const { user, savedDatasets, deleteDatasetFromDb, refreshDatasets } = useAuth();
  const { isDark } = useTheme();
  const [loadingDatasetId, setLoadingDatasetId] = useState<string | null>(null);
  const [deletingDatasetId, setDeletingDatasetId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = async (dataset: SavedDatasetMeta) => {
    if (!user) return;
    try {
      setLoadingDatasetId(dataset.id);
      const records = await getDatasetRecords(user.uid, dataset.id);
      onLoadDataset(dataset, records);
      onClose();
    } catch (err) {
      console.error('Failed to load dataset records:', err);
      alert('Failed to load records from your database. Please try again.');
    } finally {
      setLoadingDatasetId(null);
    }
  };

  const handleDelete = async (datasetId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}" from your cloud database?`)) {
      return;
    }
    try {
      setDeletingDatasetId(datasetId);
      await deleteDatasetFromDb(datasetId);
    } catch (err) {
      console.error('Failed to delete dataset:', err);
      alert('Failed to delete dataset. Please try again.');
    } finally {
      setDeletingDatasetId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Your Cloud Datasets</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Securely stored in your personal database ({user?.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {savedDatasets.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm">No saved datasets yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                When you upload Excel files or spreadsheets while signed in, they will be saved here in your isolated
                cloud database with full deliverability and outreach history.
              </p>
            </div>
          ) : (
            savedDatasets.map((dataset) => {
              const isCurrent = currentDatasetId === dataset.id;
              const isLoading = loadingDatasetId === dataset.id;
              const isDeleting = deletingDatasetId === dataset.id;

              return (
                <div
                  key={dataset.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-blue-500/80 bg-blue-50/40 dark:bg-blue-950/20'
                      : isDark
                      ? 'border-slate-800 bg-slate-800/50 hover:border-slate-700'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-bold text-sm truncate">{dataset.fileName}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            Active in View
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {dataset.rowCount.toLocaleString()} contacts
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(dataset.updatedAt || dataset.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Stats Pills */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px]">
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {dataset.validCount} valid
                        </span>
                        {dataset.riskyCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {dataset.riskyCount} risky
                          </span>
                        )}
                        {dataset.invalidCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            {dataset.invalidCount} invalid
                          </span>
                        )}
                        {(dataset.whatsappSentCount > 0 || dataset.emailSentCount > 0) && (
                          <span className="text-slate-400">•</span>
                        )}
                        {dataset.whatsappSentCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded font-medium">
                            <MessageSquare className="w-3 h-3" />
                            {dataset.whatsappSentCount} WA Sent
                          </span>
                        )}
                        {dataset.emailSentCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded font-medium">
                            <Mail className="w-3 h-3" />
                            {dataset.emailSentCount} Emails Sent
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSelect(dataset)}
                        disabled={isLoading || isDeleting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ExternalLink className="w-3.5 h-3.5" />
                        )}
                        <span>{isCurrent ? 'Reload' : 'Load'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(dataset.id, dataset.fileName)}
                        disabled={isLoading || isDeleting}
                        title="Delete from database"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>{savedDatasets.length} total datasets stored</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
