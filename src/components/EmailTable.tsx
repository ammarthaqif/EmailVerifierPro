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
}) => {
  const totalPages = Math.max(1, Math.ceil(totalFilteredRecords / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecords = records.slice(startIndex, startIndex + pageSize);

  const renderStatusBadge = (res?: VerificationResult) => {
    if (!res) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
          <Clock className="w-3 h-3 text-slate-400" />
          Untested
        </span>
      );
    }
    if (res.status === 'valid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Valid ({res.deliverabilityScore}%)
        </span>
      );
    }
    if (res.status === 'risky') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Risky ({res.deliverabilityScore}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3 h-3 text-rose-600" />
        Invalid ({res.deliverabilityScore}%)
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table responsive container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
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
          <tbody className="divide-y divide-slate-100 text-slate-800">
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

                // Extract row director / company details
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

                return (
                  <tr
                    key={rec.id}
                    className={`hover:bg-slate-50/90 transition-colors ${
                      rec.isSelected ? 'bg-blue-50/40' : ''
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
                        className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Director & Company Details */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-bold text-slate-900 text-xs truncate max-w-[180px]">
                            {ownerName || <span className="text-slate-400 italic">Not specified</span>}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-medium truncate max-w-[200px]" title={companyName}>
                            {companyName || <span className="text-slate-400 italic">No company</span>}
                          </span>
                        </div>

                        {address && (
                          <div className="flex items-start gap-1 text-[10px] text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                            <span className="truncate max-w-[220px]" title={address}>
                              {address}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Email & Phone Contact */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-xs font-semibold ${
                              rec.typoFixed
                                ? 'text-emerald-700 line-through text-slate-400'
                                : 'text-slate-900'
                            }`}
                          >
                            {rec.originalEmail || '(empty email)'}
                          </span>

                          {rec.typoFixed && (
                            <span className="font-mono text-xs font-bold text-emerald-700">
                              {rec.currentEmail}
                            </span>
                          )}
                        </div>

                        {/* Phone Number */}
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {phoneInfo.formatted ? (
                            <span className="font-mono font-medium text-slate-700">
                              {phoneInfo.formatted}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              {rawPhone ? `(${rawPhone})` : 'No phone listed'}
                            </span>
                          )}
                        </div>

                        {/* If typo is available and not yet applied */}
                        {hasTypo && (
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/90 w-fit">
                            <Wand2 className="w-3 h-3 text-amber-600" />
                            <span>Typo fix:</span>
                            <strong className="font-mono font-bold">{res?.typoSuggestion}</strong>
                            <button
                              onClick={() => onFixSingleTypo(rec)}
                              className="ml-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            >
                              Apply
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status & Score */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(res)}
                      </div>
                    </td>

                    {/* Mail Provider */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[130px] font-medium" title={res?.provider || 'Unknown'}>
                          {res?.provider || 'Pending Lookup'}
                        </span>
                      </div>
                    </td>

                    {/* Diagnosis & Explanation */}
                    <td className="py-3 px-4 text-slate-600 max-w-xs">
                      {res ? (
                        <div>
                          <p className="font-bold text-slate-800 text-[11px] truncate">
                            {res.reason}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate font-normal" title={res.explanation}>
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
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                            rec.whatsappSent
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                              : phoneInfo.isValid
                              ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{rec.whatsappSent ? 'Sent' : 'WhatsApp'}</span>
                          {rec.whatsappSent && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
                        </button>

                        {/* Preview message before sending */}
                        <button
                          type="button"
                          onClick={() => onPreviewWhatsApp(rec)}
                          id={`btn-preview-whatsapp-${rec.id}`}
                          title="Preview personalized WhatsApp message"
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Email Diagnostics Modal */}
                        <button
                          type="button"
                          onClick={() => onInspectRecord(rec)}
                          id={`btn-inspect-${rec.id}`}
                          title="View detailed DNS MX & syntax diagnostics"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
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

      {/* Pagination Footer */}
      <div className="px-4 py-3 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <span className="font-bold text-slate-900">
            {totalFilteredRecords === 0 ? 0 : startIndex + 1} -{' '}
            {Math.min(startIndex + pageSize, totalFilteredRecords)}
          </span>
          <span>of</span>
          <span className="font-bold text-slate-900">{totalFilteredRecords}</span>
          <span>records</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-600">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-semibold focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded-md hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-0.5 text-xs font-bold text-slate-900">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-md hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

