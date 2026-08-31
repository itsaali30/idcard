import React, { useState, useEffect, useRef } from 'react';
import { Search, FileSpreadsheet, ListFilter, Plus, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { IDCardRecord } from '../types';

interface SearchBarProps {
  records: IDCardRecord[];
  currentIndex: number;
  onSelectRecord: (index: number) => void;
  onOpenSheetModal: () => void;
  onOpenTableModal: () => void;
  onOpenAddModal: () => void;
  isSheetConnected: boolean;
  onSyncSheet: () => void;
  isSyncing: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  records,
  currentIndex,
  onSelectRecord,
  onOpenSheetModal,
  onOpenTableModal,
  onOpenAddModal,
  isSheetConnected,
  onSyncSheet,
  isSyncing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter records based on ID, Aadhaar number, Name (Telugu & English), Phone
  const filteredRecords = searchTerm.trim()
    ? records.filter((r) => {
        const query = searchTerm.toLowerCase().replace(/\s+/g, '');
        const cleanAadhaar = r.aadhaarNumber.replace(/\s+/g, '');
        return (
          cleanAadhaar.includes(query) ||
          r.nameEnglish.toLowerCase().includes(query) ||
          r.nameTelugu.includes(query) ||
          (r.phone && r.phone.includes(query)) ||
          r.id.includes(query)
        );
      })
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-white/[0.03] backdrop-blur-2xl px-4 py-3.5 sm:px-8 shadow-2xl shadow-black/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/25">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                ID Card Print & Download
              </h1>
              <span className="rounded-lg bg-blue-500/15 px-2 py-0.5 text-[11px] font-semibold text-blue-300 border border-blue-500/25 backdrop-blur-md">
                UIDAI &bull; భారత ప్రభుత్వం
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Google Sheets Sync &bull; Dual-Sided CR80 &bull; 300 DPI Export
            </p>
          </div>
        </div>

        {/* Center Top Search Bar */}
        <div className="relative flex-1 max-w-md" ref={dropdownRef}>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            <input
              id="search-id-input"
              type="text"
              placeholder="Search by Aadhaar, Name, or Mobile..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-400 transition-all focus:border-blue-500/50 focus:bg-slate-950/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 backdrop-blur-md shadow-inner"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setIsOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-white/10 text-[10px] text-slate-400 border border-white/10 pointer-events-none">
                /
              </kbd>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isOpen && filteredRecords.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto rounded-2xl border border-white/15 bg-slate-900/90 p-2 shadow-2xl shadow-black/90 backdrop-blur-2xl z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Found {filteredRecords.length} matching card(s):
              </div>
              {filteredRecords.map((item) => {
                const itemIndex = records.findIndex((r) => r.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectRecord(itemIndex);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition-all ${
                      itemIndex === currentIndex
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt=""
                          className="h-7 w-7 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                          {item.nameEnglish[0] || 'ID'}
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-semibold text-white">
                          {item.nameEnglish} ({item.nameTelugu})
                        </div>
                        <div className="text-[11px] text-slate-300 font-mono">
                          {item.aadhaarNumber} &bull; DOB: {item.dob}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg bg-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-white/10">
                      #{item.id}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {isOpen && searchTerm.trim() && filteredRecords.length === 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-white/15 bg-slate-900/90 p-4 text-center text-xs text-slate-400 shadow-2xl backdrop-blur-2xl z-50">
              No matching records found for "{searchTerm}"
            </div>
          )}
        </div>

        {/* Right Action Badges & Integrations */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Current Card Counter Badge */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-slate-300 backdrop-blur-md">
            <span className="text-slate-400">Record:</span>
            <span className="font-bold text-blue-400">
              {records.length > 0 ? currentIndex + 1 : 0}
            </span>
            <span className="text-slate-500">/</span>
            <span className="font-medium text-slate-300">{records.length}</span>
          </div>

          {/* Google Sheet Sync Button */}
          <button
            id="google-sheet-sync-btn"
            onClick={onOpenSheetModal}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all backdrop-blur-md border ${
              isSheetConnected
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 shadow-md shadow-emerald-500/10'
                : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
            }`}
            title="Connect / Sync with Google Sheets"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isSheetConnected ? 'Sheet Connected' : 'Google Sheet'}</span>
            {isSheetConnected && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80" />
            )}
          </button>

          {isSheetConnected && (
            <button
              onClick={onSyncSheet}
              disabled={isSyncing}
              className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 backdrop-blur-md"
              title="Refresh / Re-sync Google Sheet"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          )}

          {/* All Records Table */}
          <button
            id="view-all-records-btn"
            onClick={onOpenTableModal}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all backdrop-blur-md"
            title="View & Edit All Records in Table"
          >
            <ListFilter className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">Records Table</span>
          </button>

          {/* Add Manual Record */}
          <button
            id="add-new-record-btn"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-lg shadow-blue-600/30 active:scale-95 border border-blue-400/30"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New</span>
          </button>
        </div>
      </div>
    </header>
  );
};
