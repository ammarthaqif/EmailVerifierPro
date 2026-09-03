import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  Wand2,
  ChevronLeft,
  ChevronRight,
  Server,
  Building2,
  User,
  Smartphone,
  MapPin,
  Send,
  Eye,
  Check,
} from 'lucide-react';
import { EmailRecord, VerificationResult, ColumnMappings } from '../types';
import { cleanPhoneNumber } from '../utils/whatsappHelper';
import { useTheme } from '../context/ThemeContext';

interface EmailTableProps {
  records: EmailRecord[];
  mappings: ColumnMappings;
  defaultCountryCode: string;
  onToggleSelectRow: (id: string) => void;
  onFixSingleTypo: (record: EmailRecord) => void;
  onInspectRecord: (record: EmailRecord) => void;
  onSendWhatsApp: (record: EmailRecord) => void;
  onPreviewWhatsApp: (record: EmailRecord) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  totalFilteredRecords: number;
  viewMode?: 'table' | 'cards';
}

export const EmailTable: React.FC<EmailTableProps> = ({
  records,
  mappings,
  defaultCountryCode,
  onToggleSelectRow,
  onFixSingleTypo,
  onInspectRecord,
  onSendWhatsApp,
  onPreviewWhatsApp,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalFilteredRecords,
  viewMode = 'table',
}) => {
  const { isDark, themeConfig } = useTheme();

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecords = records.slice(startIndex, startIndex + pageSize);

  const renderStatusBadge = (res?: VerificationResult) => {
    if (!res) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Untested</span>
        </span>
      );
    }

    switch (res.status) {
      case 'valid':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
              isDark
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Valid ({res.deliverabilityScore}%)</span>
          </span>
        );
      case 'risky':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
              isDark
                ? 'bg-amber-950/70 text-amber-300 border-amber-800'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Risky ({res.deliverabilityScore}%)</span>
          </span>
        );
      case 'invalid':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
              isDark
                ? 'bg-rose-950/70 text-rose-300 border-rose-800'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Invalid ({res.deliverabilityScore}%)</span>
          </span>
        );
      default:
        return null;
    }
  };

  const extractRowDetails = (rec: EmailRecord) => {
    const ownerName =
      rec.ownerName ||
      (mappings.ownerNameColumn ? rec.rawData[mappings.ownerNameColumn] : '') ||
      rec.rawData['Director Name'] ||
      rec.rawData['Name'] ||
      '';

    const companyName =
      rec.companyName ||
      (mappings.companyNameColumn ? rec.rawData[mappings.companyNameColumn] : '') ||
      rec.rawData['Company Name'] ||
      rec.rawData['Company'] ||
      '';

    const address =
      rec.registeredAddress ||
      (mappings.addressColumn ? rec.rawData[mappings.addressColumn] : '') ||
      rec.rawData['Registered Address'] ||
      rec.rawData['Address'] ||
      '';

    const rawPhone =
      rec.phoneNumber ||
      (mappings.phoneColumn ? rec.rawData[mappings.phoneColumn] : '') ||
      rec.rawData['Phone Number'] ||
      rec.rawData['Phone'] ||
      rec.rawData['Mobile'] ||
      '';

    const phoneInfo = cleanPhoneNumber(rawPhone, defaultCountryCode);

    return { ownerName, companyName, address, phoneInfo };
  };

  return (
    <div
      className={`rounded-xl border shadow-xs overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
      }`}
    >
      {/* Cards View (Mobile adaptive or explicitly chosen) */}
      {viewMode === 'cards' ? (
        <div className="p-3 sm:p-4 space-y-3">
          {paginatedRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium text-xs">
              No records match the active filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paginatedRecords.map((rec, index) => {
                const res = rec.verification;
                const hasTypo = res?.typoSuggestion && !rec.typoFixed;
                const { ownerName, companyName, address, phoneInfo } = extractRowDetails(rec);

                return (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-xl border transition-all ${
                      rec.isSelected
                        ? isDark
                          ? 'bg-blue-950/30 border-blue-700'
                          : 'bg-blue-50/60 border-blue-300'
                        : isDark
                        ? 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header: Checkbox, Index & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!rec.isSelected}
                          onChange={() => onToggleSelectRow(rec.id)}
                          className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{startIndex + index + 1}
                        </span>
                      </div>
                      <div>{renderStatusBadge(res)}</div>
                    </div>

                    {/* Contact & Company Information */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span
                          className={`font-bold text-xs truncate ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {ownerName || <span className="text-slate-400 italic">No name provided</span>}
                        </span>
                      </div>

                      {companyName && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{companyName}</span>
                        </div>
                      )}

                      <div className="pt-1">
                        <div className="flex items-center gap-1 flex-wrap text-xs">
                          <span
                            className={`font-mono font-medium ${
                              isDark ? 'text-blue-300' : 'text-blue-600'
                            }`}
                          >
                            {rec.currentEmail}
                          </span>
                          {hasTypo && res && (
                            <button
                              type="button"
                              onClick={() => onFixSingleTypo(rec)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-1.5 py-0.5 rounded cursor-pointer min-h-[28px]"
                              title={`Auto-fix typo to ${res.typoSuggestion}`}
                            >
                              <Wand2 className="w-3 h-3 text-purple-600" />
                              <span>Fix: {res.typoSuggestion}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {phoneInfo.formatted && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Smartphone className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-mono">{phoneInfo.formatted}</span>
                        </div>
                      )}
                    </div>

                    {/* Diagnosis explanation snippet */}
                    {res && (
                      <div
                        className={`p-2 rounded-lg text-xs mb-3 ${
                          isDark ? 'bg-slate-900/80 text-slate-300' : 'bg-white text-slate-600 border border-slate-200/60'
                        }`}
                      >
                        <span className="font-semibold text-slate-400 mr-1.5">Diagnosis:</span>
                        <span>{res.reason}</span>
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => onInspectRecord(rec)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer min-h-[38px] ${
                          isDark
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        <span>Inspect</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPreviewWhatsApp(rec)}
                          className={`p-2 rounded-lg border transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center ${
                            isDark
                              ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title="Preview WhatsApp text"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onSendWhatsApp(rec)}
                          disabled={!phoneInfo.isValid}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[38px] ${
                            rec.whatsappSent
                              ? isDark
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : phoneInfo.isValid
                              ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
                              : isDark
                              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{rec.whatsappSent ? 'Sent' : 'WhatsApp'}</span>
                          {rec.whatsappSent && <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Standard Table View */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b font-bold uppercase tracking-wider text-[11px] ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                    : 'bg-slate-50/90 border-slate-200 text-slate-600'
                }`}
              >
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3 w-10 text-center">Select</th>
                <th className="py-3 px-4 min-w-[200px]">Director & Company</th>
                <th className="py-3 px-4 min-w-[220px]">Email & Contact</th>
                <th className="py-3 px-4 whitespace-nowrap">Deliverability</th>
                <th className="py-3 px-4">Mail Provider</th>
                <th className="py-3 px-4 min-w-[170px]">Diagnosis</th>
                <th className="py-3 px-4 text-right min-w-[190px]">WhatsApp & Action</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y text-xs ${
                isDark ? 'divide-slate-800 text-slate-200' : 'divide-slate-100 text-slate-800'
              }`}
            >
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No records match the active filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec, index) => {
                  const res = rec.verification;
                  const hasTypo = res?.typoSuggestion && !rec.typoFixed;
                  const { ownerName, companyName, address, phoneInfo } = extractRowDetails(rec);

                  return (
                    <tr
                      key={rec.id}
                      className={`transition-colors ${
                        rec.isSelected
                          ? isDark
                            ? 'bg-blue-950/40'
                            : 'bg-blue-50/50'
                          : isDark
                          ? 'hover:bg-slate-800/40'
                          : 'hover:bg-slate-50/90'
                      }`}
                    >
                      {/* Row Index */}
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {startIndex + index + 1}
                      </td>

                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!rec.isSelected}
                          onChange={() => onToggleSelectRow(rec.id)}
                          className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Director & Company Details */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span
                              className={`font-bold text-xs truncate max-w-[180px] ${
                                isDark ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {ownerName || <span className="text-slate-400 italic">Not specified</span>}
                            </span>
                          </div>

                          {companyName && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[180px]">{companyName}</span>
                            </div>
                          )}

                          {address && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[180px]" title={address}>
                                {address}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Email & Contact */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`font-mono font-medium ${
                                isDark ? 'text-blue-300' : 'text-blue-600'
                              }`}
                            >
                              {rec.currentEmail}
                            </span>

                            {hasTypo && res && (
                              <button
                                type="button"
                                onClick={() => onFixSingleTypo(rec)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-1.5 py-0.5 rounded cursor-pointer min-h-[26px]"
                                title={`Auto-fix typo to ${res.typoSuggestion}`}
                              >
                                <Wand2 className="w-3 h-3 text-purple-600" />
                                <span>Fix: {res.typoSuggestion}</span>
                              </button>
                            )}
                          </div>

                          {phoneInfo.formatted ? (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                              <Smartphone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-mono">{phoneInfo.formatted}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No phone provided</span>
                          )}
                        </div>
                      </td>

                      {/* Status & Score */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">{renderStatusBadge(res)}</div>
                      </td>

                      {/* Mail Provider */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span
                            className="truncate max-w-[130px] font-medium"
                            title={res?.provider || 'Unknown'}
                          >
                            {res?.provider || 'Pending Lookup'}
                          </span>
                        </div>
                      </td>

                      {/* Diagnosis & Explanation */}
                      <td className="py-3 px-4 max-w-xs">
                        {res ? (
                          <div>
                            <p
                              className={`font-bold text-[11px] truncate ${
                                isDark ? 'text-slate-200' : 'text-slate-800'
                              }`}
                            >
                              {res.reason}
                            </p>
                            <p
                              className="text-[11px] text-slate-400 truncate font-normal"
                              title={res.explanation}
                            >
                              {res.explanation}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not tested yet</span>
                        )}
                      </td>

                      {/* Actions: One-Click WhatsApp & Inspection */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* WhatsApp Action Button */}
                          <button
                            type="button"
                            onClick={() => onSendWhatsApp(rec)}
                            disabled={!phoneInfo.isValid}
                            id={`btn-whatsapp-${rec.id}`}
                            title={
                              phoneInfo.isValid
                                ? `Open WhatsApp to message ${ownerName || 'Owner'} (${phoneInfo.formatted})`
                                : 'No valid phone number detected for this row'
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[34px] ${
                              rec.whatsappSent
                                ? isDark
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : phoneInfo.isValid
                                ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
                                : isDark
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{rec.whatsappSent ? 'Sent' : 'WhatsApp'}</span>
                            {rec.whatsappSent && <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />}
                          </button>

                          {/* Preview message before sending */}
                          <button
                            type="button"
                            onClick={() => onPreviewWhatsApp(rec)}
                            id={`btn-preview-whatsapp-${rec.id}`}
                            title="Preview personalized WhatsApp message"
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center ${
                              isDark
                                ? 'border-slate-700 text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                                : 'border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* Inspect Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => onInspectRecord(rec)}
                            id={`btn-inspect-${rec.id}`}
                            title="View comprehensive technical DNS & deliverability audit"
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center ${
                              isDark
                                ? 'border-slate-700 text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                                : 'border-slate-200 text-slate-500 hover:text-blue-700 hover:bg-blue-50'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div
        className={`px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
          isDark ? 'bg-slate-800/60 border-slate-800 text-slate-400' : 'bg-slate-50/80 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span>Showing</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={`border rounded-md px-2 py-1 font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500 min-h-[34px] ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>
            of <strong className={isDark ? 'text-white' : 'text-slate-900'}>{records.length}</strong> filtered records
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border font-semibold disabled:opacity-40 cursor-pointer min-h-[34px] ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <span className="font-mono text-slate-500 px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border font-semibold disabled:opacity-40 cursor-pointer min-h-[34px] ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
