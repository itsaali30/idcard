import React from 'react';
import { X, Upload, RotateCcw, Sliders, Check, Palette } from 'lucide-react';
import { CardCustomizationConfig } from '../types';

interface CardCustomizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: CardCustomizationConfig;
  onChangeConfig: (newConfig: Partial<CardCustomizationConfig>) => void;
}

export const CardCustomizerDrawer: React.FC<CardCustomizerDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChangeConfig({ customBgUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBg = () => {
    onChangeConfig({ customBgUrl: undefined });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-white/15 bg-slate-900/90 backdrop-blur-2xl p-6 shadow-2xl shadow-black/80 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
            <Sliders className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Card Settings & Calibration</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 space-y-5 text-xs">
        {/* Custom Background Image Upload */}
        <div className="space-y-2">
          <label className="block font-semibold text-slate-200">
            Card Background Template
          </label>
          <p className="text-[11px] text-slate-400">
            You can upload a custom <code className="text-blue-300 font-mono">blank.jpg</code> image or use the high-definition built-in template.
          </p>

          <div className="flex items-center gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 px-3 font-semibold text-slate-200 transition-all backdrop-blur-md">
              <Upload className="h-4 w-4 text-blue-400" />
              <span>Upload Custom blank.jpg</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBgUpload}
                className="hidden"
              />
            </label>

            {config.customBgUrl && (
              <button
                type="button"
                onClick={handleResetBg}
                className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 hover:bg-white/10 hover:text-red-400 transition-all"
                title="Reset to default template"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>

          {config.customBgUrl && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-2.5 text-[11px] text-emerald-300 flex items-center gap-2 backdrop-blur-md">
              <Check className="h-3.5 w-3.5" />
              <span>Custom blank template active</span>
            </div>
          )}
        </div>

        {/* Card View Layout */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-200">Display Layout</label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onChangeConfig({ cardLayout: 'both' })}
              className={`rounded-xl py-2 text-center font-semibold transition-all border ${
                config.cardLayout === 'both'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                  : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-white backdrop-blur-md'
              }`}
            >
              Dual (Both)
            </button>
            <button
              onClick={() => onChangeConfig({ cardLayout: 'front' })}
              className={`rounded-xl py-2 text-center font-semibold transition-all border ${
                config.cardLayout === 'front'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                  : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-white backdrop-blur-md'
              }`}
            >
              Front Only
            </button>
            <button
              onClick={() => onChangeConfig({ cardLayout: 'back' })}
              className={`rounded-xl py-2 text-center font-semibold transition-all border ${
                config.cardLayout === 'back'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                  : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-white backdrop-blur-md'
              }`}
            >
              Back Only
            </button>
          </div>
        </div>

        {/* QR Code & Layout Alignment Controls */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <label className="block font-semibold text-slate-200">QR Code Overlay & Calibration</label>
            <span className="text-xs font-mono text-blue-300">
              {config.qrSize ?? 156}px
            </span>
          </div>

          <label className="flex items-center justify-between cursor-pointer rounded-xl bg-white/[0.03] hover:bg-white/[0.06] p-3 border border-white/10 backdrop-blur-md transition-colors">
            <span className="text-xs text-slate-300">
              Hide Dynamic QR (Use Template's Printed QR)
            </span>
            <input
              type="checkbox"
              checked={!!config.hideDynamicQr}
              onChange={(e) => onChangeConfig({ hideDynamicQr: e.target.checked })}
              className="h-4 w-4 rounded accent-blue-500"
            />
          </label>

          {!config.hideDynamicQr && (
            <div className="space-y-3 rounded-xl bg-white/[0.02] p-3 border border-white/10">
              {/* Presets */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onChangeConfig({ qrSize: 156, qrOffsetX: 0, qrOffsetY: 0 })}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                    (config.qrSize ?? 156) === 156
                      ? 'bg-blue-600/80 text-white border-blue-400'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  blank.jpg Cover (156px)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeConfig({ qrSize: 142 })}
                  className={`py-1 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                    config.qrSize === 142
                      ? 'bg-blue-600/80 text-white border-blue-400'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  Medium (142px)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeConfig({ qrSize: 115 })}
                  className={`py-1 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                    config.qrSize === 115
                      ? 'bg-blue-600/80 text-white border-blue-400'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  Compact (115px)
                </button>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>QR Code Size Slider</span>
                  <span className="font-mono text-blue-400">{config.qrSize ?? 156}px</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="190"
                  step="1"
                  value={config.qrSize ?? 156}
                  onChange={(e) => onChangeConfig({ qrSize: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>Nudge X</span>
                    <span>{config.qrOffsetX ?? 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="1"
                    value={config.qrOffsetX ?? 0}
                    onChange={(e) => onChangeConfig({ qrOffsetX: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>Nudge Y</span>
                    <span>{config.qrOffsetY ?? 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="1"
                    value={config.qrOffsetY ?? 0}
                    onChange={(e) => onChangeConfig({ qrOffsetY: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Photo Calibration */}
        <div className="space-y-2 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <label className="block font-semibold text-slate-200">Front Photo Position</label>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/[0.02] p-3 border border-white/10">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Photo Nudge X</span>
                <span>{config.photoOffsetX ?? 0}px</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={config.photoOffsetX ?? 0}
                onChange={(e) => onChangeConfig({ photoOffsetX: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Photo Nudge Y</span>
                <span>{config.photoOffsetY ?? 0}px</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={config.photoOffsetY ?? 0}
                onChange={(e) => onChangeConfig({ photoOffsetY: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Security / Privacy Options */}
        <div className="space-y-2 border-t border-white/10 pt-4">
          <label className="block font-semibold text-slate-200">Options & Safety</label>

          <label className="flex items-center justify-between cursor-pointer rounded-xl bg-white/[0.03] hover:bg-white/[0.06] p-3 border border-white/10 backdrop-blur-md transition-colors">
            <span className="text-slate-300">Mask Aadhaar (XXXX XXXX 1234)</span>
            <input
              type="checkbox"
              checked={config.maskAadhaar}
              onChange={(e) => onChangeConfig({ maskAadhaar: e.target.checked })}
              className="h-4 w-4 rounded accent-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer rounded-xl bg-white/[0.03] hover:bg-white/[0.06] p-3 border border-white/10 backdrop-blur-md transition-colors">
            <span className="text-slate-300">Show Scissor Cut & Fold Line</span>
            <input
              type="checkbox"
              checked={config.showCutLines}
              onChange={(e) => onChangeConfig({ showCutLines: e.target.checked })}
              className="h-4 w-4 rounded accent-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer rounded-xl bg-white/[0.03] hover:bg-white/[0.06] p-3 border border-white/10 backdrop-blur-md transition-colors">
            <span className="text-slate-300">Ultra High-DPI Print Render</span>
            <input
              type="checkbox"
              checked={config.highDpi}
              onChange={(e) => onChangeConfig({ highDpi: e.target.checked })}
              className="h-4 w-4 rounded accent-blue-500"
            />
          </label>
        </div>

        {/* Physical Dimension Spec */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-4 text-[11px] space-y-1 text-slate-400">
          <div className="font-semibold text-slate-300">CR80 Physical Card Specs:</div>
          <div>&bull; Single Card Size: 85.60 mm &times; 53.98 mm</div>
          <div>&bull; Dual Folded Size: 171.20 mm &times; 53.98 mm</div>
          <div>&bull; Standard PVC Card / 300 GSM Art Card</div>
        </div>
      </div>
    </div>
  );
};
