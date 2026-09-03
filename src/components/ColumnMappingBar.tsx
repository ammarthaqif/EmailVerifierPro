import React, { useState } from 'react';
import {
  FileSpreadsheet,
  SlidersHorizontal,
  Check,
  ChevronDown,
  Mail,
  Smartphone,
  User,
  Building2,
  MapPin,
} from 'lucide-react';
import { ColumnMappings } from '../types';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFieldChange = (key: keyof ColumnMappings, value: string) => {
    onUpdateMappings({
      ...mappings,
      [key]: value,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Primary Bar */}
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm">{fileName}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-semibold">
                {rowCount} rows
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/80">
                Sheet: {sheetName}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Email Column:{' '}
              <strong className="text-slate-800 font-semibold">
                {mappings.emailColumn || '(none)'}
              </strong>{' '}
              • Phone Column:{' '}
              <strong className="text-slate-800 font-semibold">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>{isExpanded ? 'Hide Column Mapping' : 'Adjust Column Mapping'}</span>
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Draft Prescripted WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Expanded Column Mapping Grid */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-slate-50/70 animate-in fade-in">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Verify & Match Excel Columns with Owner / Company Fields:
            </span>
            <span className="text-[11px] text-slate-500">
              Changes update verification & WhatsApp tags instantly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Email Column */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Email (Required)</span>
              </label>
              <select
                value={mappings.emailColumn}
                onChange={(e) => handleFieldChange('emailColumn', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-semibold focus:ring-blue-500 focus:border-blue-500"
              >
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Column */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phone / WhatsApp</span>
              </label>
              <select
                value={mappings.phoneColumn}
                onChange={(e) => handleFieldChange('phoneColumn', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-semibold focus:ring-emerald-500 focus:border-emerald-500"
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
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Director / Owner</span>
              </label>
              <select
                value={mappings.ownerNameColumn}
                onChange={(e) => handleFieldChange('ownerNameColumn', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-semibold focus:ring-indigo-500 focus:border-indigo-500"
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
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Company Name</span>
              </label>
              <select
                value={mappings.companyNameColumn}
                onChange={(e) => handleFieldChange('companyNameColumn', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-semibold focus:ring-purple-500 focus:border-purple-500"
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
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Registered Address</span>
              </label>
              <select
                value={mappings.addressColumn}
                onChange={(e) => handleFieldChange('addressColumn', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-semibold focus:ring-rose-500 focus:border-rose-500"
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
