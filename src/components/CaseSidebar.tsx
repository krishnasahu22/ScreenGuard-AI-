import React, { useState } from 'react';
import { EvidenceCase } from '../types/forensic';
import { Search, AlertTriangle, CheckCircle2, ShieldAlert, Plus, HardDrive } from 'lucide-react';

interface CaseSidebarProps {
  cases: EvidenceCase[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onOpenIngest: () => void;
}

export const CaseSidebar: React.FC<CaseSidebarProps> = ({
  cases,
  activeCaseId,
  onSelectCase,
  onOpenIngest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCases = cases.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'News / Press', 'Insurance Fraud', 'Identity Credential', 'Aerial Reconnaissance'];

  return (
    <aside className="w-80 border-r border-slate-200 bg-white flex flex-col h-[calc(100vh-3.5rem)] shrink-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
              Evidence Vault
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {cases.length} Dossiers
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, title, category..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Category horizontal filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 rounded whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Case List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredCases.map((item) => {
          const isActive = item.id === activeCaseId;
          const isTampered = item.status === 'Confirmed Tampered';
          const isFlagged = item.status === 'Flagged Inconsistent';

          return (
            <div
              key={item.id}
              onClick={() => onSelectCase(item.id)}
              className={`p-3.5 cursor-pointer transition-colors relative ${
                isActive
                  ? 'bg-blue-50/70 border-l-2 border-l-blue-600'
                  : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-mono text-xs font-semibold text-slate-900">
                  {item.code}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium px-1.5 py-0.5 rounded ${
                    isTampered
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : isFlagged
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isTampered ? (
                    <ShieldAlert className="w-3 h-3" />
                  ) : isFlagged ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  {item.status}
                </span>
              </div>

              <h4 className="text-xs font-medium text-slate-800 line-clamp-1 mb-2">
                {item.title}
              </h4>

              {/* Case thumbnail preview & metadata */}
              <div className="flex items-center gap-2.5">
                <div className="w-14 h-10 rounded border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={item.imageSrc}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{item.category}</span>
                    <span>{item.fileSize}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Resolution</span>
                    <span className="text-slate-700">
                      {item.dimensions.width}×{item.dimensions.height} px
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCases.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No evidence dossiers found matching current filter.
          </div>
        )}
      </div>

      {/* Ingest Button in footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <button
          onClick={onOpenIngest}
          className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span>Ingest New Evidence Item</span>
        </button>
      </div>
    </aside>
  );
};
