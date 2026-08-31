import React, { useState } from 'react';
import { X, UserPlus, Image as ImageIcon, Save, Sparkles } from 'lucide-react';
import { IDCardRecord } from '../types';

interface AddEditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: IDCardRecord) => void;
  initialRecord?: IDCardRecord | null;
}

export const AddEditRecordModal: React.FC<AddEditRecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRecord,
}) => {
  if (!isOpen) return null;

  const isEditing = !!initialRecord;

  const [formData, setFormData] = useState<Partial<IDCardRecord>>(() => {
    if (initialRecord) return { ...initialRecord };
    return {
      id: String(Date.now()),
      aadhaarNumber: '4920 8192 3719',
      nameTelugu: 'కె. రమేష్ కుమార్',
      nameEnglish: 'K. Ramesh Kumar',
      dob: '15/08/1990',
      genderTelugu: 'పురుషుడు',
      genderEnglish: 'MALE',
      fatherOrHusbandName: 'S/O: వెంకటేశ్వర్లు',
      phone: '9876543210',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      issueDate: '22/07/2011',
      detailsAsOn: '26/02/2026',
      addressTelugu: 'చిరునామా: డోర్ నెం: 4-52/1, గాంధీ నగర్, గుంటూరు, ఆంధ్రప్రదేశ్ - 522002',
      addressEnglish: 'Address: D.No: 4-52/1, Gandhi Nagar, Guntur, Andhra Pradesh - 522002',
      pinCode: '522002',
    };
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, photoUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameEnglish || !formData.aadhaarNumber) {
      alert('Please fill in required fields (Name and Aadhaar Number)');
      return;
    }

    onSave({
      id: formData.id || String(Date.now()),
      aadhaarNumber: formData.aadhaarNumber || '1234 5678 9012',
      nameTelugu: formData.nameTelugu || 'పేరు',
      nameEnglish: formData.nameEnglish || 'Name',
      dob: formData.dob || '01/01/1990',
      genderTelugu: formData.genderTelugu || 'పురుషుడు',
      genderEnglish: formData.genderEnglish || 'MALE',
      fatherOrHusbandName: formData.fatherOrHusbandName,
      phone: formData.phone,
      photoUrl: formData.photoUrl,
      issueDate: formData.issueDate || '22/07/2011',
      detailsAsOn: formData.detailsAsOn || '26/02/2026',
      addressTelugu: formData.addressTelugu || 'చిరునామా:',
      addressEnglish: formData.addressEnglish || 'Address:',
      pinCode: formData.pinCode,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-900/85 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl shadow-black/80">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-300 shadow-md">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? 'Edit Cardholder Details' : 'Add New Cardholder'}
              </h2>
              <p className="text-xs text-slate-400">
                Update cardholder information for instant card rendering
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Aadhaar Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Aadhaar Number (12 digits) *
              </label>
              <input
                type="text"
                required
                value={formData.aadhaarNumber || ''}
                onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                placeholder="4582 9104 3821"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 backdrop-blur-md"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300">Mobile Number</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 backdrop-blur-md"
              />
            </div>

            {/* Name in Telugu */}
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                పేరు / Name in Telugu *
              </label>
              <input
                type="text"
                required
                value={formData.nameTelugu || ''}
                onChange={(e) => setFormData({ ...formData, nameTelugu: e.target.value })}
                placeholder="కె. రమేష్ కుమార్"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-xs text-white font-['Noto_Sans_Telugu'] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 backdrop-blur-md"
              />
            </div>

            {/* Name in English */}
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Name in English *
              </label>
              <input
                type="text"
                required
                value={formData.nameEnglish || ''}
                onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                placeholder="K. Ramesh Kumar"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 backdrop-blur-md"
              />
            </div>

            {/* DOB */}
            <div>
              <label className="block text-xs font-medium text-slate-300">DOB (DD/MM/YYYY)</label>
              <input
                type="text"
                value={formData.dob || ''}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                placeholder="15/08/1990"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 backdrop-blur-md"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-slate-300">Gender / లింగం</label>
              <select
                value={formData.genderEnglish || 'MALE'}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    genderEnglish: val,
                    genderTelugu: val === 'MALE' ? 'పురుషుడు' : val === 'FEMALE' ? 'స్త్రీ' : 'ఇతర',
                  });
                }}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 backdrop-blur-md"
              >
                <option value="MALE">పురుషుడు / MALE</option>
                <option value="FEMALE">స్త్రీ / FEMALE</option>
                <option value="TRANSGENDER">ఇతర / TRANSGENDER</option>
              </select>
            </div>

            {/* Father / Husband Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Father / Husband / Care Of
              </label>
              <input
                type="text"
                value={formData.fatherOrHusbandName || ''}
                onChange={(e) => setFormData({ ...formData, fatherOrHusbandName: e.target.value })}
                placeholder="S/O: వెంకటేశ్వర్లు"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 backdrop-blur-md"
              />
            </div>

            {/* Issue Date & Details As On */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300">Issue Date</label>
                <input
                  type="text"
                  value={formData.issueDate || ''}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  placeholder="22/07/2011"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 backdrop-blur-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">Details As On</label>
                <input
                  type="text"
                  value={formData.detailsAsOn || ''}
                  onChange={(e) => setFormData({ ...formData, detailsAsOn: e.target.value })}
                  placeholder="26/02/2026"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 backdrop-blur-md"
                />
              </div>
            </div>
          </div>

          {/* Photo URL or Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">Photo</label>
            <div className="mt-1 flex items-center gap-3">
              {formData.photoUrl && (
                <img
                  src={formData.photoUrl}
                  alt="Preview"
                  className="h-12 w-10 rounded-xl border border-white/20 object-cover"
                />
              )}
              <input
                type="text"
                value={formData.photoUrl || ''}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg or upload file"
                className="flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 backdrop-blur-md"
              />
              <label className="flex items-center gap-1.5 cursor-pointer rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all backdrop-blur-md shrink-0">
                <ImageIcon className="h-4 w-4 text-blue-400" />
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Address Telugu */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              చిరునామా / Address in Telugu
            </label>
            <textarea
              rows={2}
              value={formData.addressTelugu || ''}
              onChange={(e) => setFormData({ ...formData, addressTelugu: e.target.value })}
              placeholder="చిరునామా: డోర్ నెం: 4-52/1, గాంధీ నగర్, గుంటూరు..."
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-xs text-white font-['Noto_Sans_Telugu'] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 backdrop-blur-md"
            />
          </div>

          {/* Address English */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Address in English
            </label>
            <textarea
              rows={2}
              value={formData.addressEnglish || ''}
              onChange={(e) => setFormData({ ...formData, addressEnglish: e.target.value })}
              placeholder="Address: D.No: 4-52/1, Gandhi Nagar, Guntur, Andhra Pradesh - 522002"
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 backdrop-blur-md"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-semibold text-slate-300 transition-all backdrop-blur-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-bold text-white shadow-xl shadow-blue-600/30 transition-all active:scale-95 border border-blue-400/30"
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? 'Save Changes' : 'Create Card'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
