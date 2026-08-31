import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Eye,
  EyeOff,
  Layers,
  Scissors,
  FileText,
  Image as ImageIcon,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { CardCustomizationConfig, IDCardRecord } from '../types';

interface ControlBarProps {
  currentIndex: number;
  totalRecords: number;
  onPrev: () => void;
  onNext: () => void;
  onDownload: (format: 'png' | 'jpeg' | 'pdf', target: 'both' | 'front' | 'back') => void;
  onPrint: () => void;
  onOpenBatchPrint: () => void;
  config: CardCustomizationConfig;
  onChangeConfig: (newConfig: Partial<CardCustomizationConfig>) => void;
  currentRecord: IDCardRecord;
  onToggleCustomizer: () => void;
  isCustomizerOpen: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  currentIndex,
  totalRecords,
  onPrev,
  onNext,
  onDownload,
  onPrint,
  onOpenBatchPrint,
  config,
  onChangeConfig,
  currentRecord,
  onToggleCustomizer,
  isCustomizerOpen,
}) => {
  const [downloadDropdown, setDownloadDropdown] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-3 sm:p-4 shadow-2xl shadow-black/20">
      {/* Navigation Buttons: Prev and Next */}
      <div className="flex items-center gap-2.5">
        <button
          id="prev-record-btn"
          onClick={onPrev}
          disabled={totalRecords <= 1}
          className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/15 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-xl active:scale-95 disabled:pointer-events-none disabled:opacity-30 backdrop-blur-md"
          title="Previous ID Card (Left Arrow)"
        >
          <ChevronLeft className="h-4 w-4 text-blue-400" />
          <span>Previous</span>
          <span className="hidden md:inline text-[10px] text-slate-400 font-mono">(&larr;)</span>
        </button>

        <div className="flex items-center justify-center rounded-xl bg-slate-950/60 px-3.5 py-2 text-xs font-bold text-slate-200 border border-white/10 backdrop-blur-md">
          <span className="text-blue-400 font-mono">{currentIndex + 1}</span>
          <span className="mx-1.5 text-slate-500">/</span>
          <span className="text-slate-400 font-mono">{totalRecords}</span>
        </div>

        <button
          id="next-record-btn"
          onClick={onNext}
          disabled={totalRecords <= 1}
          className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/15 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-xl active:scale-95 disabled:pointer-events-none disabled:opacity-30 backdrop-blur-md"
          title="Next ID Card (Right Arrow)"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4 text-blue-400" />
          <span className="hidden md:inline text-[10px] text-slate-400 font-mono">(&rarr;)</span>
        </button>
      </div>

      {/* View Options & Toggles */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Layout Selector */}
        <div className="flex items-center rounded-xl bg-slate-950/60 p-1 border border-white/10 text-xs backdrop-blur-md">
          <button
            onClick={() => onChangeConfig({ cardLayout: 'both' })}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
              config.cardLayout === 'both'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Both (Dual)
          </button>
          <button
            onClick={() => onChangeConfig({ cardLayout: 'front' })}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
              config.cardLayout === 'front'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Front
          </button>
          <button
            onClick={() => onChangeConfig({ cardLayout: 'back' })}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
              config.cardLayout === 'back'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Back
          </button>
        </div>

        {/* Mask Aadhaar Toggle */}
        <button
          onClick={() => onChangeConfig({ maskAadhaar: !config.maskAadhaar })}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all backdrop-blur-md ${
            config.maskAadhaar
              ? 'border-blue-500/40 bg-blue-500/20 text-blue-300 shadow-md shadow-blue-500/10'
              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
          title="Toggle Aadhaar Masking (XXXX XXXX 1234)"
        >
          {config.maskAadhaar ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span>{config.maskAadhaar ? 'Masked' : 'Unmasked'}</span>
        </button>

        {/* Cut Lines Toggle */}
        {config.cardLayout === 'both' && (
          <button
            onClick={() => onChangeConfig({ showCutLines: !config.showCutLines })}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all backdrop-blur-md ${
              config.showCutLines
                ? 'border-sky-500/40 bg-sky-500/20 text-sky-300'
                : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
            title="Toggle center scissor cut & fold line"
          >
            <Scissors className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cut Line</span>
          </button>
        )}

        {/* Customizer Drawer Button */}
        <button
          onClick={onToggleCustomizer}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all backdrop-blur-md ${
            isCustomizerOpen
              ? 'border-purple-500/50 bg-purple-500/20 text-purple-300'
              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
          title="Customize Background Image & Calibration"
        >
          <Sliders className="h-3.5 w-3.5 text-purple-400" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      {/* Main Action Buttons: Download & Print */}
      <div className="flex items-center gap-2.5">
        {/* Download Dropdown */}
        <div className="relative">
          <button
            id="download-card-btn"
            onClick={() => setDownloadDropdown(!downloadDropdown)}
            className="group flex items-center gap-2.5 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 px-5 py-2.5 rounded-2xl transition-all duration-300 text-white font-bold text-xs sm:text-sm shadow-xl active:scale-95 backdrop-blur-md"
          >
            <Download className="h-4 w-4 text-blue-400 group-hover:text-white transition-colors" />
            <span>Download</span>
          </button>

          {downloadDropdown && (
            <div className="absolute right-0 bottom-full mb-2.5 w-60 overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 p-2 shadow-2xl shadow-black/90 backdrop-blur-2xl z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Download Options
              </div>
              <button
                onClick={() => {
                  onDownload('png', config.cardLayout);
                  setDownloadDropdown(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-white hover:bg-white/10 transition-colors"
              >
                <ImageIcon className="h-4 w-4 text-emerald-400" />
                <div>
                  <div className="font-semibold">High-Res PNG (300 DPI)</div>
                  <div className="text-[10px] text-slate-400">Crisp image for printing</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onDownload('pdf', config.cardLayout);
                  setDownloadDropdown(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-white hover:bg-white/10 transition-colors"
              >
                <FileText className="h-4 w-4 text-blue-400" />
                <div>
                  <div className="font-semibold">Standard PDF Card</div>
                  <div className="text-[10px] text-slate-400">CR80 standard physical size</div>
                </div>
              </button>

              <div className="my-1 border-t border-white/10" />

              <button
                onClick={() => {
                  onDownload('png', 'front');
                  setDownloadDropdown(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-white/10 transition-colors"
              >
                <Layers className="h-3.5 w-3.5 text-sky-400" />
                <span>Front Side Only (PNG)</span>
              </button>

              <button
                onClick={() => {
                  onDownload('png', 'back');
                  setDownloadDropdown(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-white/10 transition-colors"
              >
                <Layers className="h-3.5 w-3.5 text-purple-400" />
                <span>Back Side Only (PNG)</span>
              </button>
            </div>
          )}
        </div>

        {/* Print Button */}
        <button
          id="print-card-btn"
          onClick={onPrint}
          className="group flex items-center gap-2.5 bg-white hover:bg-slate-100 text-slate-950 px-6 py-2.5 rounded-2xl shadow-2xl shadow-blue-500/20 hover:scale-[1.03] transition-all duration-300 font-bold text-xs sm:text-sm active:scale-95 border border-white"
        >
          <Printer className="h-4 w-4 text-blue-600" />
          <span>Print Card</span>
        </button>

        {/* Batch Print All Cards Button */}
        <button
          id="batch-print-btn"
          onClick={onOpenBatchPrint}
          className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all backdrop-blur-md active:scale-95"
          title="Print multiple cards on A4 sheet"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>Batch A4 Print</span>
        </button>
      </div>
    </div>
  );
};
