import React, { useState } from 'react';
import { X, Printer, CheckSquare, Square, FileText, Download } from 'lucide-react';
import { IDCardRecord, CardCustomizationConfig } from '../types';
import { AadhaarCardTemplate } from './AadhaarCardTemplate';

interface BatchPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: IDCardRecord[];
  config: CardCustomizationConfig;
}

export const BatchPrintModal: React.FC<BatchPrintModalProps> = ({
  isOpen,
  onClose,
  records,
  config,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => records.map((r) => r.id));

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r.id));
    }
  };

  const handlePrintBatch = () => {
    window.print();
  };

  const selectedRecords = records.filter((r) => selectedIds.includes(r.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="relative flex max-h-[95vh] w-full max-w-6xl flex-col rounded-3xl border border-white/15 bg-slate-900/85 backdrop-blur-2xl shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-300 shadow-md">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Batch ID Card Print (A4 Layout)</h2>
              <p className="text-xs text-slate-400">
                Select multiple cards to print in standard foldable / dual-sided A4 sheet format
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

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all backdrop-blur-md"
            >
              {selectedIds.length === records.length ? (
                <CheckSquare className="h-4 w-4 text-blue-400" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
              <span>
                {selectedIds.length === records.length ? 'Deselect All' : 'Select All'} ({selectedIds.length}/{records.length})
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintBatch}
              disabled={selectedRecords.length === 0}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-bold text-white shadow-xl shadow-blue-600/30 transition-all active:scale-95 border border-blue-400/30 disabled:opacity-40"
            >
              <Printer className="h-4 w-4" />
              <span>Print {selectedRecords.length} Selected Cards</span>
            </button>
          </div>
        </div>

        {/* Selection Cards List & Preview */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {records.map((rec) => {
              const isChecked = selectedIds.includes(rec.id);
              return (
                <div
                  key={rec.id}
                  onClick={() => toggleSelect(rec.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition-all backdrop-blur-md ${
                    isChecked
                      ? 'border-blue-500/50 bg-blue-500/15 shadow-md shadow-blue-500/10'
                      : 'border-white/10 bg-white/[0.03] opacity-70 hover:opacity-100 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-blue-400">
                      {isChecked ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-slate-500" />}
                    </div>
                    {rec.photoUrl ? (
                      <img
                        src={rec.photoUrl}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {rec.nameEnglish[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-xs text-white">{rec.nameEnglish}</div>
                      <div className="text-[11px] font-mono text-slate-400">{rec.aadhaarNumber}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">#{rec.id}</span>
                </div>
              );
            })}
          </div>

          {/* Printable Sheet View */}
          <div className="mt-6 border-t border-white/10 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Print Sheet Layout Preview:
            </h3>
            <div
              id="batch-print-container"
              className="flex flex-col items-center gap-6 bg-slate-950/60 p-6 rounded-2xl border border-white/10 backdrop-blur-md overflow-x-auto"
            >
              {selectedRecords.map((rec, i) => (
                <div key={rec.id} className="relative scale-90 sm:scale-100 origin-center">
                  <AadhaarCardTemplate
                    record={rec}
                    config={{ ...config, cardLayout: 'both', showCutLines: true }}
                    id={`batch-card-${rec.id}`}
                  />
                  <div className="text-center text-[10px] text-slate-500 mt-1">
                    Card {i + 1} &bull; {rec.nameEnglish} ({rec.aadhaarNumber})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
