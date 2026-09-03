import React, { useState } from 'react';
import {
  FileSpreadsheet,
  SlidersHorizontal,
  ChevronDown,
  Mail,
  Smartphone,
  User,
  Building2,
  MapPin,
} from 'lucide-react';
import { ColumnMappings } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ColumnMappingBarProps {
  fileName: string;
  sheetName: string;
  rowCount: number;
  columns: string[];
  mappings: ColumnMappings;
  onUpdateMappings: (newMappings: ColumnMappings) => void;
  onOpenWhatsAppModal: () => void;
}

export const ColumnMappingBar: React.FC<ColumnMappingBarProps> = ({
  fileName,
  sheetName,
  rowCount,
  columns,
  mappings,
  onUpdateMappings,
  onOpenWhatsAppModal,
}) => {
  const { isDark, themeConfig } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFieldChange = (key: keyof ColumnMappings, value: string) => {
    onUpdateMappings({
      ...mappings,
      [key]: value,
    });
  };

  return (
    <div
      className={`rounded-xl border shadow-xs overflow-hidden mb-4 transition-colors ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200/90 text-slate-900'
      }`}
    >
      {/* Primary Bar */}
      <div className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
            style={{ backgroundColor: themeConfig.accentColor }}
          >
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm truncate max-w-[200px] sm:max-w-xs">
                {fileName}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-semibold ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {rowCount} rows
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${
                  isDark
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                }`}
              >
                Sheet: {sheetName}
              </span>
            </div>
            <p
              className={`text-[11px] sm:text-xs font-medium mt-0.5 truncate ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Email:{' '}
              <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                {mappings.emailColumn || '(none)'}
              </strong>{' '}
              • Phone:{' '}
              <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                {mappings.phoneColumn || '(auto-detect)'}
              </strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            id="btn-toggle-column-mappings"
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer min-h-[38px] ${
              isDark
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>{isExpanded ? 'Hide Mapping' : 'Adjust Mapping'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          <button
            type="button"
            onClick={onOpenWhatsAppModal}
            id="btn-open-whatsapp-modal-bar"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[38px]"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Draft Prescripted WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Expanded Column Mapping Grid */}
      {isExpanded && (
        <div
          className={`px-3.5 sm:px-4 pb-4 pt-3 border-t animate-in fade-in ${
            isDark ? 'border-slate-800 bg-slate-850/60' : 'border-slate-100 bg-slate-50/70'
          }`}
        >
          <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Verify & Match Excel Columns with Owner / Company Fields:
            </span>
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Changes update verification & WhatsApp tags instantly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {/* Email Column */}
            <div
              className={`p-2.5 rounded-lg border shadow-2xs ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <label
                className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>Email (Required)</span>
              </label>
              <select
                value={mappings.emailColumn}
                onChange={(e) => handleFieldChange('emailColumn', e.target.value)}
                className={`w-full border rounded-md px-2 py-1.5 text-xs font-semibold focus:ring-blue-500 focus:border-blue-500 cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Column */}
            <div
              className={`p-2.5 rounded-lg border shadow-2xs ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <label
                className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Phone / WhatsApp</span>
              </label>
              <select
                value={mappings.phoneColumn}
                onChange={(e) => handleFieldChange('phoneColumn', e.target.value)}
                className={`w-full border rounded-md px-2 py-1.5 text-xs font-semibold focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value="">-- None / Select Column --</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Director / Owner Column */}
            <div
              className={`p-2.5 rounded-lg border shadow-2xs ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <label
                className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Director / Owner</span>
              </label>
              <select
                value={mappings.ownerNameColumn}
                onChange={(e) => handleFieldChange('ownerNameColumn', e.target.value)}
                className={`w-full border rounded-md px-2 py-1.5 text-xs font-semibold focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value="">-- None / Select Column --</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Name Column */}
            <div
              className={`p-2.5 rounded-lg border shadow-2xs ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <label
                className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Company Name</span>
              </label>
              <select
                value={mappings.companyNameColumn}
                onChange={(e) => handleFieldChange('companyNameColumn', e.target.value)}
                className={`w-full border rounded-md px-2 py-1.5 text-xs font-semibold focus:ring-purple-500 focus:border-purple-500 cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value="">-- None / Select Column --</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Registered Address Column */}
            <div
              className={`p-2.5 rounded-lg border shadow-2xs ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <label
                className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Registered Address</span>
              </label>
              <select
                value={mappings.addressColumn}
                onChange={(e) => handleFieldChange('addressColumn', e.target.value)}
                className={`w-full border rounded-md px-2 py-1.5 text-xs font-semibold focus:ring-rose-500 focus:border-rose-500 cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value="">-- None / Select Column --</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
