import React, { useState, useEffect, useRef } from 'react';
import { IDCardRecord } from '../types';
import {
  Upload,
  Camera,
  Check,
  Plus,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  User,
  Hash,
  Calendar,
  MapPin,
  Save,
} from 'lucide-react';

interface TopImageUploadBarProps {
  currentRecord: IDCardRecord;
  customBgUrl?: string;
  onUpdateCurrentRecord: (updatedRecord: IDCardRecord) => void;
  onAddNewRecord: (newRecord: IDCardRecord) => void;
  onResetToDefault: () => void;
  onCustomBgUpload: (file: File) => void;
  onRemoveCustomBg: () => void;
}

export const TopImageUploadBar: React.FC<TopImageUploadBarProps> = ({
  currentRecord,
  customBgUrl,
  onUpdateCurrentRecord,
  onAddNewRecord,
  onResetToDefault,
  onCustomBgUpload,
  onRemoveCustomBg,
}) => {
  const [formData, setFormData] = useState<IDCardRecord>(currentRecord);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Sync form data when current record changes
  useEffect(() => {
    setFormData(currentRecord);
  }, [currentRecord]);

  const handleInputChange = (field: keyof IDCardRecord, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-format Aadhaar number with spaces: "1234 5678 9012"
      if (field === 'aadhaarNumber') {
        const raw = value.replace(/\D/g, '').slice(0, 12);
        const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
        updated.aadhaarNumber = formatted;
      }
      return updated;
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const updated = { ...formData, photoUrl: result };
      setFormData(updated);
      onUpdateCurrentRecord(updated);
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateCurrentRecord(formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 2500);
  };

  const handleSaveAsNew = () => {
    const newRec: IDCardRecord = {
      ...formData,
      id: Date.now().toString(),
    };
    onAddNewRecord(newRec);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 2500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-white/15 bg-slate-900/80 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl shadow-black/60 transition-all no-print">
      {/* Top Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Image Upload & Preview Controls */}
        <div className="flex items-center gap-3.5">
          {/* Photo Preview & Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group h-14 w-14 sm:h-16 sm:w-16 cursor-pointer rounded-2xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden shrink-0 ${
              dragActive
                ? 'border-blue-400 bg-blue-500/20 scale-105'
                : 'border-white/25 hover:border-blue-400/80 bg-white/5 hover:bg-white/10'
            }`}
            title="Click or Drag & Drop to upload photo"
          >
            {formData.photoUrl ? (
              <img
                src={formData.photoUrl}
                alt="Cardholder Photo"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-300">
                <Camera className="h-6 w-6" />
                <span className="text-[9px] font-medium mt-0.5">Upload</span>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
              <Upload className="h-5 w-5" />
              <span className="text-[9px] font-bold">Change</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                Quick Upload & Live Submit
              </span>
              {isSubmitted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40 animate-pulse">
                  <Check className="h-3 w-3" /> Updated!
                </span>
              )}
            </div>
            <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{formData.nameEnglish || 'Cardholder Name'}</span>
              {formData.nameTelugu && (
                <span className="text-xs text-slate-400 font-['Noto_Sans_Telugu']">
                  ({formData.nameTelugu})
                </span>
              )}
            </div>
            <div className="text-xs font-mono text-slate-400">
              UID: {formData.aadhaarNumber || '0000 0000 0000'}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main Upload Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-md active:scale-95 backdrop-blur-md"
            title="Upload cardholder portrait photo"
          >
            <Camera className="h-4 w-4 text-blue-300" />
            <span>Upload Photo</span>
          </button>

          {/* Upload Background Template (blank.jpg) */}
          <button
            type="button"
            onClick={() => bgInputRef.current?.click()}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all shadow-md active:scale-95 backdrop-blur-md ${
              customBgUrl
                ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                : 'border-white/15 bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Upload blank.jpg background template"
          >
            <ImageIcon className={`h-4 w-4 ${customBgUrl ? 'text-emerald-300' : 'text-amber-300'}`} />
            <span>{customBgUrl ? 'Template (blank.jpg) Active' : 'Upload blank.jpg (BG)'}</span>
          </button>

          <input
            ref={bgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                onCustomBgUpload(f);
                setIsSubmitted(true);
                setTimeout(() => setIsSubmitted(false), 2500);
              }
            }}
          />

          {customBgUrl && (
            <button
              type="button"
              onClick={onRemoveCustomBg}
              className="text-[11px] text-slate-400 hover:text-red-400 transition-colors px-1"
              title="Remove custom background template"
            >
              Clear BG
            </button>
          )}

          {/* Quick Submit / Apply Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95 border border-blue-400/40"
          >
            <Save className="h-4 w-4" />
            <span>Submit / Update Card</span>
          </button>

          {/* Expand Form Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition-all backdrop-blur-md"
          >
            <span>{isExpanded ? 'Hide Details' : 'Edit Details'}</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Fast Form */}
      {isExpanded && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2"
        >
          {/* English Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <User className="h-3 w-3 text-blue-400" /> Name (English)
            </label>
            <input
              type="text"
              value={formData.nameEnglish}
              onChange={(e) => handleInputChange('nameEnglish', e.target.value)}
              placeholder="e.g. Mohammed Khurram Ali"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* Telugu Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 font-['Noto_Sans_Telugu']">
              పేరు (Telugu Name)
            </label>
            <input
              type="text"
              value={formData.nameTelugu}
              onChange={(e) => handleInputChange('nameTelugu', e.target.value)}
              placeholder="మొహమ్మద్ ఖుర్రం అలీ"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white font-['Noto_Sans_Telugu'] placeholder-slate-500 focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* Aadhaar Number */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Hash className="h-3 w-3 text-blue-400" /> Aadhaar UID
            </label>
            <input
              type="text"
              value={formData.aadhaarNumber}
              onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
              placeholder="6193 0483 1201"
              maxLength={14}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-blue-400" /> DOB
              </label>
              <input
                type="text"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                placeholder="14/09/1994"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-2.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={formData.genderEnglish}
                onChange={(e) => {
                  const val = e.target.value;
                  handleInputChange('genderEnglish', val);
                  handleInputChange('genderTelugu', val === 'FEMALE' ? 'స్త్రీ' : 'పురుషుడు');
                }}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-2 py-2 text-xs text-white focus:border-blue-400 focus:outline-none"
              >
                <option value="MALE" className="bg-slate-900">MALE</option>
                <option value="FEMALE" className="bg-slate-900">FEMALE</option>
                <option value="TRANSGENDER" className="bg-slate-900">OTHER</option>
              </select>
            </div>
          </div>

          {/* Telugu Address */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1 font-['Noto_Sans_Telugu']">
              <MapPin className="h-3 w-3 text-blue-400" /> చిరునామా (Telugu Address)
            </label>
            <input
              type="text"
              value={formData.addressTelugu}
              onChange={(e) => handleInputChange('addressTelugu', e.target.value)}
              placeholder="చిరునామా: S/O మొహ్ద్ షరీఫ్ అలీ, ..."
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-['Noto_Sans_Telugu'] text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* English Address */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-blue-400" /> Address (English)
            </label>
            <input
              type="text"
              value={formData.addressEnglish}
              onChange={(e) => handleInputChange('addressEnglish', e.target.value)}
              placeholder="Address: S/O Mohd Shareef Ali, ..."
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* Form Bottom Submission Bar */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onResetToDefault}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset to Sample Profile (Mohammed Khurram Ali)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAsNew}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Save as New Record</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all border border-blue-400/40 active:scale-95"
              >
                <Save className="h-4 w-4" />
                <span>Apply & Update Live Card</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
