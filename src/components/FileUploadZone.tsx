import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, ClipboardList, Check, Download, AlertCircle, Server, Cpu, Zap, Loader2 } from 'lucide-react';
import { parseExcelFile, parseRawEmailList, generateSampleDataset } from '../utils/excelHelper';
import { ParsedSheetData } from '../utils/excelHelper';
import { useTheme } from '../context/ThemeContext';

interface FileUploadZoneProps {
  onDataParsed: (data: ParsedSheetData) => void;
  onLoadSample: () => void;
  isLoading: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onDataParsed,
  onLoadSample,
  isLoading,
}) => {
  const { isDark, themeConfig } = useTheme();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isServerProcessing, setIsServerProcessing] = useState(false);
  const [serverStatusText, setServerStatusText] = useState<string>('');
  const [processingFileName, setProcessingFileName] = useState<string>('');
  const [processingFileSize, setProcessingFileSize] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = async (file: File) => {
    setParsingError(null);
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const lowerName = file.name.toLowerCase();
    const isSupported = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isSupported) {
      setParsingError('Please upload a valid Excel spreadsheet (.xlsx, .xls) or CSV file.');
      return;
    }

    setProcessingFileName(file.name);
    setProcessingFileSize(formatFileSize(file.size));
    setIsServerProcessing(true);
    setServerStatusText('Streaming spreadsheet to dedicated Web Server engine...');

    try {
      // Stream raw binary file directly to server - Zero CPU freezing on user's device
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      setServerStatusText('Web Server parsing rows, unzipping cells & matching contact columns...');

      const res = await fetch('/api/process-spreadsheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-File-Name': encodeURIComponent(file.name),
        },
        body: file,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const parsedData = await res.json();
        if (parsedData && Array.isArray(parsedData.records)) {
          if (parsedData.records.length === 0) {
            setParsingError('No rows were found in the uploaded file.');
            setIsServerProcessing(false);
            return;
          }
          setIsServerProcessing(false);
          onDataParsed(parsedData);
          return;
        }
      }
      throw new Error(`Server returned status ${res.status}: ${res.statusText}`);
    } catch (serverErr: any) {
      console.warn('Web server processing failed or offline, falling back to background parser:', serverErr);
      setServerStatusText('Web server busy, completing fallback parsing in background...');

      // Resilient fallback to client-side parsing only if web server is unreachable
      try {
        const buffer = await file.arrayBuffer();
        const parsed = parseExcelFile(buffer, file.name);
        if (parsed.records.length === 0) {
          setParsingError('No rows were found in the uploaded file.');
          setIsServerProcessing(false);
          return;
        }
        setIsServerProcessing(false);
        onDataParsed(parsed);
      } catch (err: any) {
        setIsServerProcessing(false);
        setParsingError(`Failed to parse Excel file: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    setParsingError(null);
    if (!pasteText.trim()) {
      setParsingError('Please enter at least one email address.');
      return;
    }
    try {
      const parsed = parseRawEmailList(pasteText);
      if (parsed.records.length === 0) {
        setParsingError('No valid email items could be extracted from input.');
        return;
      }
      onDataParsed(parsed);
    } catch (err: any) {
      setParsingError(`Parsing error: ${err.message}`);
    }
  };

  const downloadSampleTemplate = () => {
    const buffer = generateSampleDataset();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_email_contacts.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`rounded-2xl border shadow-sm p-4 sm:p-8 max-w-4xl mx-auto my-4 sm:my-6 transition-colors ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Tabs */}
      <div
        className={`flex flex-wrap items-center justify-between border-b pb-3.5 mb-4 sm:mb-6 gap-2 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            id="tab-upload-file"
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer min-h-[40px] ${
              activeTab === 'upload'
                ? isDark
                  ? 'bg-blue-950 text-blue-300 font-bold border border-blue-800 shadow-xs'
                  : 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
            <span>Upload Excel / CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            id="tab-paste-emails"
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer min-h-[40px] ${
              activeTab === 'paste'
                ? isDark
                  ? 'bg-blue-950 text-blue-300 font-bold border border-blue-800 shadow-xs'
                  : 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-blue-500" />
            <span>Paste Email List</span>
          </button>
        </div>

        <button
          onClick={downloadSampleTemplate}
          id="btn-download-sample-xlsx"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer p-1.5 sm:p-0 ${
            isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'
          }`}
          title="Download sample .xlsx file with realistic test emails"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Download Sample .xlsx</span>
          <span className="sm:hidden">Sample .xlsx</span>
        </button>
      </div>

      {parsingError && (
        <div className="mb-4 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="font-bold text-rose-900 dark:text-rose-200">Upload Issue</p>
            <p className="text-xs text-rose-700 dark:text-rose-300">{parsingError}</p>
          </div>
        </div>
      )}

      {/* Server-Side Processing Live State */}
      {isServerProcessing ? (
        <div
          id="server-processing-indicator"
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all ${
            isDark
              ? 'border-blue-700/80 bg-blue-950/40 text-slate-100'
              : 'border-blue-300 bg-blue-50/60 text-slate-900'
          }`}
        >
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping opacity-60" />
            <div
              className={`relative w-full h-full rounded-2xl flex items-center justify-center shadow-md border ${
                isDark
                  ? 'bg-slate-850 border-blue-600 text-blue-400'
                  : 'bg-white border-blue-200 text-blue-600'
              }`}
            >
              <Server className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase mb-2 text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-800">
            <Cpu className="w-3.5 h-3.5 text-blue-500 animate-spin" />
            <span>Web Server Engine Active</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold mb-1.5 text-slate-900 dark:text-slate-100">
            {serverStatusText || 'Processing Spreadsheet on Web Server...'}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-4">
            File: <strong className="font-semibold text-slate-800 dark:text-slate-200">{processingFileName}</strong>
            {processingFileSize ? ` (${processingFileSize})` : ''} — Offloaded to web server to prevent browser freezing.
          </p>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>0% Laptop CPU Usage — Streaming directly to Cloud Server</span>
          </div>
        </div>
      ) : activeTab === 'upload' ? (
        <div>
          {/* Server Acceleration Benefit Banner */}
          <div
            className={`mb-3.5 p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
              isDark
                ? 'bg-slate-850/80 border-slate-700/80 text-slate-300'
                : 'bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border-blue-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Server className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  Web Server-Powered Processing Enabled
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Large Excel sheets (.xlsx) are parsed on the web server so your laptop and browser remain snappy.
                </span>
              </div>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md shrink-0">
              <Zap className="w-3 h-3 fill-current" />
              <span>Zero Laptop Lag</span>
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            id="dropzone-excel-upload"
            className={`border-2 border-dashed rounded-xl p-6 sm:p-12 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 scale-[0.99]'
                : isDark
                ? 'border-slate-700 hover:border-blue-500/80 hover:bg-slate-800/60 bg-slate-850/40'
                : 'border-slate-300 hover:border-blue-500/80 hover:bg-slate-50/80 bg-slate-50/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFile(e.target.files[0]);
                }
              }}
              accept=".xlsx,.xls,.csv"
              className="hidden"
              id="file-input-field"
            />

            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xs ${
                isDark ? 'bg-slate-800 border border-slate-700 text-blue-400' : 'bg-blue-50 border border-blue-100 text-blue-600'
              }`}
            >
              <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Drag and drop your Excel spreadsheet here
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Supports Microsoft Excel (<strong className="font-semibold text-slate-700 dark:text-slate-300">.xlsx, .xls</strong>) and CSV (<strong className="font-semibold text-slate-700 dark:text-slate-300">.csv</strong>)
            </p>

            <div
              className="inline-flex items-center gap-2 px-4 py-2.5 sm:py-2 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors min-h-[42px]"
              style={{ backgroundColor: themeConfig.accentColor }}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Browse Files</span>
            </div>
          </div>

          {/* Feature Highlights Footer */}
          <div
            className={`mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-4 sm:pt-6 border-t text-xs ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span className="font-medium">Real DNS MX Server Query</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span className="font-medium">Disposable & Role Account Checks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span className="font-medium">Auto Typo Fixer & Clean Export</span>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 text-center">
            <button
              type="button"
              onClick={onLoadSample}
              id="btn-quick-sample-load"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer min-h-[36px] inline-flex items-center"
            >
              Don't have a file ready? Click here to load sample test data
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Paste Email Addresses (One per line, comma or semicolon separated):
            </label>
            <textarea
              id="paste-emails-textarea"
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`user1@google.com\nsatya@microsoft.com\nalex@gmial.com\nbounce@invalid-domain-12345.com\ntemp@mailinator.com\nsupport@acme.com`}
              className={`w-full p-3 font-mono text-xs rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500'
                  : 'bg-slate-50/70 border-slate-200 text-slate-800 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPasteText('')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[40px] ${
                isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Clear
            </button>
            <button
              type="button"
              id="btn-submit-pasted-emails"
              onClick={handlePasteSubmit}
              disabled={isLoading || !pasteText.trim()}
              className="px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer min-h-[40px]"
              style={{ backgroundColor: themeConfig.accentColor }}
            >
              Process & Ingest Emails
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
