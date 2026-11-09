import React from 'react';
import { Shield, FileText, Upload, SlidersHorizontal, Info, History, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'canvas' | 'exif' | 'custody';
  setActiveTab: (tab: 'dashboard' | 'canvas' | 'exif' | 'custody') => void;
  onOpenReport: () => void;
  onOpenIngest: () => void;
  activeCaseCode: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  onOpenIngest,
  activeCaseCode,
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 select-none sticky top-0 z-30">
      {/* Zone 1: Single Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-xs">
          <Shield className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-base tracking-tight text-slate-900 whitespace-nowrap">
            Forensic Investigation Interface
          </span>
          <span className="text-xs font-mono text-slate-400 font-normal">
            v2.4
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Single-Line Controls) */}
      <nav className="hidden md:flex items-center gap-1 shrink-0 p-1 bg-slate-100 rounded-md">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeTab === 'canvas'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Canvas Lab</span>
          <span className="text-[11px] font-mono text-slate-400">[{activeCaseCode}]</span>
        </button>

        <button
          onClick={() => setActiveTab('exif')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeTab === 'exif'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>EXIF Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('custody')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeTab === 'custody'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Chain of Custody</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenIngest}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span>Ingest Evidence</span>
        </button>

        <button
          onClick={onOpenReport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Export Forensic Report</span>
        </button>
      </div>
    </header>
  );
};
