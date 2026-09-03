import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, ClipboardList, Check, Download, AlertCircle } from 'lucide-react';
import { parseExcelFile, parseRawEmailList, generateSampleDataset } from '../utils/excelHelper';
import { ParsedSheetData } from '../utils/excelHelper';

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
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parsingError, setParsingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setParsingError(null);
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const lowerName = file.name.toLowerCase();
    const isSupported = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isSupported) {
      setParsingError('Please upload a valid Excel spreadsheet (.xlsx, .xls) or CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const parsed = parseExcelFile(buffer, file.name);
        if (parsed.records.length === 0) {
          setParsingError('No rows were found in the uploaded file.');
          return;
        }
        onDataParsed(parsed);
      } catch (err: any) {
        setParsingError(`Failed to parse Excel file: ${err.message || 'Unknown error'}`);
      }
    };
    reader.onerror = () => {
      setParsingError('Error reading file from disk.');
    };
    reader.readAsArrayBuffer(file);
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto my-6">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            id="tab-upload-file"
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Upload Excel / CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            id="tab-paste-emails"
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-blue-600" />
            <span>Paste Email List</span>
          </button>
        </div>

        <button
          onClick={downloadSampleTemplate}
          id="btn-download-sample-xlsx"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-semibold transition-colors cursor-pointer"
          title="Download sample .xlsx file with realistic test emails"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Sample .xlsx</span>
        </button>
      </div>

      {parsingError && (
        <div className="mb-4 p-3.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="font-bold text-rose-900">Upload Issue</p>
            <p className="text-xs text-rose-700">{parsingError}</p>
          </div>
        </div>
      )}

      {activeTab === 'upload' ? (
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            id="dropzone-excel-upload"
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
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

            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Drag and drop your Excel spreadsheet here
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Supports Microsoft Excel (<strong className="font-semibold text-slate-700">.xlsx, .xls</strong>) and Comma-Separated Values (<strong className="font-semibold text-slate-700">.csv</strong>)
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Browse Files</span>
            </div>
          </div>

          {/* Feature Highlights Footer */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              <span className="font-medium">Real DNS MX Server Query</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              <span className="font-medium">Disposable & Role Account Checks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              <span className="font-medium">Auto Typo Fixer & Clean Export</span>
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={onLoadSample}
              id="btn-quick-sample-load"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-4 cursor-pointer"
            >
              Don't have a file ready? Click here to load sample test data
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Paste Email Addresses (One per line, comma or semicolon separated):
            </label>
            <textarea
              id="paste-emails-textarea"
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`user1@google.com\nsatya@microsoft.com\nalex@gmial.com\nbounce@invalid-domain-12345.com\ntemp@mailinator.com\nsupport@acme.com`}
              className="w-full p-3 font-mono text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPasteText('')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              id="btn-submit-pasted-emails"
              onClick={handlePasteSubmit}
              disabled={isLoading || !pasteText.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              Process & Ingest Emails
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
