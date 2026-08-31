import React, { useState } from 'react';
import {
  X,
  Search,
  Download,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { IDCardRecord } from '../types';

interface DataTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: IDCardRecord[];
  currentIndex: number;
  onSelectRecord: (index: number) => void;
  onEditRecord: (record: IDCardRecord) => void;
  onDeleteRecord: (index: number) => void;
}

export const DataTableModal: React.FC<DataTableModalProps> = ({
  isOpen,
  onClose,
  records,
  currentIndex,
  onSelectRecord,
  onEditRecord,
  onDeleteRecord,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const filtered = records.filter((r) => {
    const q = filterQuery.toLowerCase();
    return (
      r.aadhaarNumber.toLowerCase().includes(q) ||
      r.nameEnglish.toLowerCase().includes(q) ||
      r.nameTelugu.toLowerCase().includes(q) ||
      (r.phone && r.phone.includes(q)) ||
      r.dob.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-3xl border border-white/15 bg-slate-900/85 backdrop-blur-2xl shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-white">All Loaded Records ({records.length})</h2>
            <p className="text-xs text-slate-400">
              Click on any row or view button to load it instantly into the ID card preview
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] p-4 backdrop-blur-md">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter records by name, aadhaar, or phone..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 backdrop-blur-md"
            />
          </div>
          <div className="text-xs text-slate-400">
            Showing <span className="font-bold text-blue-400">{filtered.length}</span> of{' '}
            {records.length} records
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-2">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 backdrop-blur-md text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 border-b border-white/10">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Photo</th>
                <th className="p-3">Aadhaar Number</th>
                <th className="p-3">Name (English / Telugu)</th>
                <th className="p-3">DOB / Gender</th>
                <th className="p-3">Address</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((item) => {
                const originalIndex = records.findIndex((r) => r.id === item.id);
                const isSelected = originalIndex === currentIndex;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-blue-600/15 border-l-4 border-blue-500 text-white'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <td className="p-3 font-mono text-slate-400">#{item.id}</td>
                    <td className="p-3">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                          {item.nameEnglish[0] || 'ID'}
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-300 whitespace-nowrap">
                      {item.aadhaarNumber}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{item.nameEnglish}</div>
                      <div className="text-[11px] text-slate-400 font-['Noto_Sans_Telugu']">
                        {item.nameTelugu}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-mono text-slate-300">{item.dob}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.genderEnglish} ({item.genderTelugu})
                      </div>
                    </td>
                    <td className="p-3 max-w-xs truncate text-[11px] text-slate-400">
                      {item.addressEnglish}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            onSelectRecord(originalIndex);
                            onClose();
                          }}
                          className="flex items-center gap-1 rounded-xl bg-blue-600/25 hover:bg-blue-600 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:text-white transition-all shadow-sm"
                          title="View / Print this ID card"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => onEditRecord(item)}
                          className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                          title="Edit Cardholder"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {records.length > 1 && (
                          <button
                            onClick={() => onDeleteRecord(originalIndex)}
                            className="rounded-xl p-1.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
