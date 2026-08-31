import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { fetchGoogleSheetData, parseCsvToRecords, generateSampleCsvString } from '../utils/googleSheet';
import { IDCardRecord } from '../types';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadRecords: (records: IDCardRecord[], sourceInfo: string) => void;
  currentSheetUrl: string;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  onLoadRecords,
  currentSheetUrl,
}) => {
  const [sheetUrl, setSheetUrl] = useState(currentSheetUrl);
  const [sheetName, setSheetName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFetchSheet = async () => {
    if (!sheetUrl.trim()) {
      setErrorMessage('Please enter a valid Google Sheet URL or Sheet ID');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await fetchGoogleSheetData(sheetUrl, sheetName || undefined);
      if (result.records.length === 0) {
        throw new Error('No valid records found in the specified sheet.');
      }
      setSuccessMessage(`Successfully loaded ${result.records.length} records!`);
      setTimeout(() => {
        onLoadRecords(result.records, sheetUrl);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to fetch Google Sheet data. Please verify your sheet sharing permissions.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = parseCsvToRecords(text);
        if (result.records.length === 0) {
          throw new Error('No records could be parsed from uploaded file.');
        }
        setSuccessMessage(`Imported ${result.records.length} records from ${file.name}`);
        setTimeout(() => {
          onLoadRecords(result.records, file.name);
          onClose();
        }, 700);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to parse CSV file');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const csvContent = generateSampleCsvString();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'aadhaar_id_cards_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-900/85 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl shadow-black/80">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-md">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Connect Google Sheet Data</h2>
              <p className="text-xs text-slate-400">
                Fetch and live-sync ID card records directly from your Google Spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-4">
          {/* Status Banners */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 backdrop-blur-md">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Connection Issue</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-3.5 text-xs text-emerald-300 backdrop-blur-md">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google Sheet URL Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              Google Sheet URL or Sheet ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                className="flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono backdrop-blur-md"
              />
              <button
                type="button"
                onClick={handleFetchSheet}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50 shrink-0 shadow-lg shadow-blue-600/30 active:scale-95 border border-blue-400/30"
              >
                {isLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Fetch Sheet</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Paste your standard Google Sheet browser URL or published CSV link.
            </p>
          </div>

          {/* Optional Sheet Tab Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Sheet Tab Name (Optional - defaults to first tab)
            </label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="e.g. Sheet1 or AadhaarCards"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 backdrop-blur-md"
            />
          </div>

          {/* Quick Guide Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-blue-400">
              <HelpCircle className="h-4 w-4" />
              <span>How to make your Google Sheet readable:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11.5px] leading-relaxed">
              <li>Open your Google Sheet and click the <strong>"Share"</strong> button at top right.</li>
              <li>Under General Access, change to <strong>"Anyone with the link"</strong> &rarr; <strong>"Viewer"</strong>.</li>
              <li>Copy the URL from your browser address bar and paste it above!</li>
            </ol>
          </div>

          {/* Alternative: Upload CSV / Template Download */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all backdrop-blur-md">
              <Upload className="h-4 w-4 text-blue-400" />
              <span>Upload CSV / Excel File</span>
              <input
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleDownloadSample}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download CSV Template (.csv)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
