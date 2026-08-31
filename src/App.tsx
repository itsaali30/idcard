import React, { useState, useEffect, useCallback } from 'react';
import { SAMPLE_RECORDS } from './data/sampleData';
import { IDCardRecord, CardCustomizationConfig } from './types';
import { AadhaarCardTemplate } from './components/AadhaarCardTemplate';
import { SearchBar } from './components/SearchBar';
import { ControlBar } from './components/ControlBar';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import { DataTableModal } from './components/DataTableModal';
import { AddEditRecordModal } from './components/AddEditRecordModal';
import { BatchPrintModal } from './components/BatchPrintModal';
import { CardCustomizerDrawer } from './components/CardCustomizerDrawer';
import { TopImageUploadBar } from './components/TopImageUploadBar';
import { downloadCardAsImage, downloadCardAsPdf, triggerPrintCard } from './utils/exportUtils';
import { fetchGoogleSheetData } from './utils/googleSheet';
import {
  FileSpreadsheet,
  CheckCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  QrCode,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  // Main Records State (initialized with realistic Telugu+English sample data)
  const [records, setRecords] = useState<IDCardRecord[]>(() => {
    const saved = localStorage.getItem('idcard_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved records', e);
      }
    }
    return SAMPLE_RECORDS;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSheetConnected, setIsSheetConnected] = useState<boolean>(() => {
    return !!localStorage.getItem('idcard_sheet_url');
  });
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    return localStorage.getItem('idcard_sheet_url') || '';
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Card customization settings
  const [config, setConfig] = useState<CardCustomizationConfig>({
    scale: 1,
    showCutLines: true,
    maskAadhaar: false,
    highDpi: true,
    cardLayout: 'both',
    fontScale: 1,
    photoBorder: true,
    contrastMode: false,
  });

  // Modal open states
  const [isSheetModalOpen, setIsSheetModalOpen] = useState<boolean>(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [isBatchPrintModalOpen, setIsBatchPrintModalOpen] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<IDCardRecord | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Persist records to local storage
  useEffect(() => {
    localStorage.setItem('idcard_records', JSON.stringify(records));
  }, [records]);

  // Keep index in valid range
  useEffect(() => {
    if (currentIndex >= records.length && records.length > 0) {
      setCurrentIndex(records.length - 1);
    }
  }, [records.length, currentIndex]);

  const currentRecord: IDCardRecord = records[currentIndex] || SAMPLE_RECORDS[0];

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : records.length - 1));
  }, [records.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < records.length - 1 ? prev + 1 : 0));
  }, [records.length]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        triggerPrintCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Google Sheet Data Load handler
  const handleLoadSheetRecords = (newRecords: IDCardRecord[], sourceUrl: string) => {
    setRecords(newRecords);
    setCurrentIndex(0);
    setSheetUrl(sourceUrl);
    setIsSheetConnected(true);
    localStorage.setItem('idcard_sheet_url', sourceUrl);
    showToast(`Loaded ${newRecords.length} cards from Google Sheet!`);
  };

  // Re-sync Sheet
  const handleSyncSheet = async () => {
    if (!sheetUrl) {
      setIsSheetModalOpen(true);
      return;
    }
    setIsSyncing(true);
    try {
      const result = await fetchGoogleSheetData(sheetUrl);
      if (result.records.length > 0) {
        setRecords(result.records);
        showToast(`Synced ${result.records.length} records successfully!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to sync Google Sheet');
    } finally {
      setIsSyncing(false);
    }
  };

  // Add or Update Record
  const handleSaveRecord = (savedRec: IDCardRecord) => {
    if (editingRecord) {
      setRecords((prev) =>
        prev.map((r) => (r.id === savedRec.id ? savedRec : r))
      );
      showToast(`Updated cardholder: ${savedRec.nameEnglish}`);
    } else {
      setRecords((prev) => [savedRec, ...prev]);
      setCurrentIndex(0);
      showToast(`Added new cardholder: ${savedRec.nameEnglish}`);
    }
    setEditingRecord(null);
  };

  const handleEditRecord = (rec: IDCardRecord) => {
    setEditingRecord(rec);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteRecord = (idx: number) => {
    if (records.length <= 1) {
      showToast('Cannot delete the only record');
      return;
    }
    const recName = records[idx].nameEnglish;
    setRecords((prev) => prev.filter((_, i) => i !== idx));
    if (currentIndex >= idx && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
    showToast(`Deleted card for ${recName}`);
  };

  // Download Handler
  const handleDownload = async (
    format: 'png' | 'jpeg' | 'pdf',
    target: 'both' | 'front' | 'back'
  ) => {
    try {
      showToast(`Generating high-res ${format.toUpperCase()}...`);
      let elementId = 'aadhaar-card-print-area';
      let suffix = 'Dual_Full';

      if (target === 'front') {
        elementId = 'aadhaar-front-card';
        suffix = 'Front';
      } else if (target === 'back') {
        elementId = 'aadhaar-back-card';
        suffix = 'Back';
      }

      if (format === 'pdf') {
        await downloadCardAsPdf(elementId, currentRecord, target === 'both');
      } else {
        await downloadCardAsImage(elementId, currentRecord, format, suffix);
      }
      showToast(`Downloaded successfully!`);
    } catch (err: any) {
      console.error('Download error:', err);
      showToast('Download failed. Please try again.');
    }
  };

  const updateConfig = (newCfg: Partial<CardCustomizationConfig>) => {
    setConfig((prev) => ({ ...prev, ...newCfg }));
  };

  const handleUpdateCurrentRecord = (updatedRec: IDCardRecord) => {
    setRecords((prev) =>
      prev.map((r, i) => (i === currentIndex ? updatedRec : r))
    );
    showToast(`Updated card for ${updatedRec.nameEnglish || 'cardholder'}`);
  };

  const handleAddNewRecord = (newRec: IDCardRecord) => {
    setRecords((prev) => [newRec, ...prev]);
    setCurrentIndex(0);
    showToast(`Added new cardholder: ${newRec.nameEnglish || 'New Card'}`);
  };

  const handleResetToDefaultSample = () => {
    setRecords(SAMPLE_RECORDS);
    setCurrentIndex(0);
    showToast('Reset to default Mohammed Khurram Ali card');
  };

  const handleCustomBgFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      updateConfig({ customBgUrl: result });
      showToast('Loaded background template (blank.jpg)');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomBg = () => {
    updateConfig({ customBgUrl: undefined });
    showToast('Switched to built-in vector template');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Ambient Frosted Background Light Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-blue-600/30 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-indigo-600/25 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-[15%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-sky-500/15 rounded-full blur-[130px]" />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-900/80 px-5 py-3.5 text-xs font-semibold text-slate-100 shadow-2xl shadow-black/60 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Search Bar & Header */}
      <SearchBar
        records={records}
        currentIndex={currentIndex}
        onSelectRecord={(idx) => setCurrentIndex(idx)}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
        onOpenTableModal={() => setIsTableModalOpen(true)}
        onOpenAddModal={() => {
          setEditingRecord(null);
          setIsAddEditModalOpen(true);
        }}
        isSheetConnected={isSheetConnected}
        onSyncSheet={handleSyncSheet}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Image Upload & Submit Action Bar */}
        <TopImageUploadBar
          currentRecord={currentRecord}
          customBgUrl={config.customBgUrl}
          onUpdateCurrentRecord={handleUpdateCurrentRecord}
          onAddNewRecord={handleAddNewRecord}
          onResetToDefault={handleResetToDefaultSample}
          onCustomBgUpload={handleCustomBgFile}
          onRemoveCustomBg={handleRemoveCustomBg}
        />

        {/* Top Info Banner for Google Sheet Source */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-5 py-3 text-xs text-slate-300 shadow-lg shadow-black/20 no-print">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
            <span>
              Active Data Source:{' '}
              <strong className="text-white font-semibold">
                {isSheetConnected ? 'Connected Google Sheet' : 'Preloaded Authentic Dataset'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
            >
              View all {records.length} records &rarr;
            </button>
          </div>
        </div>

        {/* Middle Card Preview Workspace */}
        <div className="relative flex flex-col items-center justify-center w-full my-auto py-2">
          {/* Ambient Card Backlight */}
          <div className="relative group flex flex-col items-center justify-center w-full max-w-5xl">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-sky-500/30 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-60 transition duration-700 pointer-events-none" />

            <div className="relative w-full rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-col items-center justify-center max-w-full overflow-x-auto">
              {/* Cardholder Quick Banner */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 w-full max-w-4xl px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-md no-print">
                <div className="flex items-center gap-3">
                  {currentRecord.photoUrl ? (
                    <img
                      src={currentRecord.photoUrl}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover border border-white/20 shadow-md"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-md">
                      {currentRecord.nameEnglish[0]}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{currentRecord.nameEnglish}</span>
                      <span className="font-['Noto_Sans_Telugu'] text-slate-300">
                        ({currentRecord.nameTelugu})
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-blue-300">
                      UID: {currentRecord.aadhaarNumber} &bull; DOB: {currentRecord.dob}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditRecord(currentRecord)}
                    className="rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-md active:scale-95"
                  >
                    Edit Card Data
                  </button>
                </div>
              </div>

              {/* Quick On-Screen QR Code & Photo Calibration Toolbar */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5 w-full max-w-4xl px-3 py-2 rounded-xl bg-slate-950/70 border border-blue-500/20 backdrop-blur-md text-xs no-print">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                    <QrCode className="h-3.5 w-3.5" />
                    QR Size:
                  </span>
                  
                  {/* Minus / Plus Quick Size */}
                  <div className="flex items-center rounded-lg bg-white/5 border border-white/10 p-0.5">
                    <button
                      type="button"
                      onClick={() => updateConfig({ qrSize: Math.max(70, (config.qrSize ?? 156) - 4) })}
                      className="px-2 py-0.5 rounded hover:bg-white/10 text-white font-bold text-xs active:scale-95 transition-all"
                      title="Decrease QR Size"
                    >
                      &minus;
                    </button>
                    <span className="px-2 py-0.5 font-mono text-emerald-400 font-bold text-[11px]">
                      {config.qrSize ?? 156}px
                    </span>
                    <button
                      type="button"
                      onClick={() => updateConfig({ qrSize: Math.min(200, (config.qrSize ?? 156) + 4) })}
                      className="px-2 py-0.5 rounded hover:bg-white/10 text-white font-bold text-xs active:scale-95 transition-all"
                      title="Increase QR Size"
                    >
                      &#43;
                    </button>
                  </div>

                  {/* Preset Buttons */}
                  <button
                    type="button"
                    onClick={() => updateConfig({ qrSize: 156, qrOffsetX: 0, qrOffsetY: 0 })}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all ${
                      (config.qrSize ?? 156) === 156
                        ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                    title="Exact 156px cover match for blank.jpg template"
                  >
                    Exact Match (156px)
                  </button>

                  <button
                    type="button"
                    onClick={() => updateConfig({ hideDynamicQr: !config.hideDynamicQr })}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all ${
                      config.hideDynamicQr
                        ? 'bg-amber-600/80 text-white border-amber-400'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                    title="Toggle between dynamically generated QR and blank.jpg's printed QR"
                  >
                    {config.hideDynamicQr ? 'Using Template QR' : 'Dynamic 2D QR Active'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomizerOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 text-[10.5px] font-semibold transition-all"
                  >
                    Fine-tune Position &rarr;
                  </button>
                </div>
              </div>

              {/* THE ID CARD CANVAS / TEMPLATE */}
              <div className="transform-gpu transition-transform duration-200">
                <AadhaarCardTemplate
                  record={currentRecord}
                  config={config}
                  id="aadhaar-card-print-area"
                />
              </div>

              {/* Quick Hints below card */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 no-print">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                  Standard CR80 Size (85.6mm &times; 53.98mm)
                </span>
                <span>&bull;</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                  Foldable with Center Cut Line
                </span>
                <span>&bull;</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                  Use &larr; / &rarr; arrow keys to navigate cards
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Control Bar (Prev, Next, Download, Print) */}
        <div className="w-full no-print">
          <ControlBar
            currentIndex={currentIndex}
            totalRecords={records.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onDownload={handleDownload}
            onPrint={triggerPrintCard}
            onOpenBatchPrint={() => setIsBatchPrintModalOpen(true)}
            config={config}
            onChangeConfig={updateConfig}
            currentRecord={currentRecord}
            onToggleCustomizer={() => setIsCustomizerOpen(!isCustomizerOpen)}
            isCustomizerOpen={isCustomizerOpen}
          />
        </div>
      </main>

      {/* Modals & Drawers */}
      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        onLoadRecords={handleLoadSheetRecords}
        currentSheetUrl={sheetUrl}
      />

      <DataTableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        records={records}
        currentIndex={currentIndex}
        onSelectRecord={(idx) => setCurrentIndex(idx)}
        onEditRecord={handleEditRecord}
        onDeleteRecord={handleDeleteRecord}
      />

      <AddEditRecordModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        initialRecord={editingRecord}
      />

      <BatchPrintModal
        isOpen={isBatchPrintModalOpen}
        onClose={() => setIsBatchPrintModalOpen(false)}
        records={records}
        config={config}
      />

      <CardCustomizerDrawer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={config}
        onChangeConfig={updateConfig}
      />
    </div>
  );
}
