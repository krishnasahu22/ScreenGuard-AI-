import React from 'react';
import { EvidenceCase } from '../types/forensic';
import { Activity, AlertTriangle, ShieldCheck, FileCheck } from 'lucide-react';

interface TelemetryVerdictCardProps {
  currentCase: EvidenceCase;
}

export const TelemetryVerdictCard: React.FC<TelemetryVerdictCardProps> = ({ currentCase }) => {
  const scores = currentCase.telemetryScores;
  const isHighRisk = scores.overallTamperIndex >= 70;
  const isMediumRisk = scores.overallTamperIndex >= 40 && scores.overallTamperIndex < 70;

  return (
    <div className="bg-white border border-slate-200 rounded p-4 space-y-3.5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
            Forensic Integrity Verdict
          </h3>
        </div>
        <span
          className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded uppercase ${
            isHighRisk
              ? 'bg-red-50 text-red-700 border border-red-200'
              : isMediumRisk
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {scores.verdict}
        </span>
      </div>

      {/* Main Score Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-600 font-medium">Aggregate Tamper Probability Index:</span>
          <span
            className={`font-mono font-bold text-sm ${
              isHighRisk ? 'text-red-600' : isMediumRisk ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {scores.overallTamperIndex}%
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isHighRisk ? 'bg-red-600' : isMediumRisk ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${scores.overallTamperIndex}%` }}
          />
        </div>
      </div>

      {/* Sub-Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs font-mono">
        {/* Compression Uniformity */}
        <div className="p-2 rounded bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] font-sans text-slate-500 block truncate">
            Compression Uniformity
          </span>
          <span className="text-slate-800 font-semibold text-xs block">
            {scores.compressionUniformity}%
          </span>
          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full"
              style={{ width: `${scores.compressionUniformity}%` }}
            />
          </div>
        </div>

        {/* Noise Continuity */}
        <div className="p-2 rounded bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] font-sans text-slate-500 block truncate">
            Sensor Noise Continuity
          </span>
          <span className="text-slate-800 font-semibold text-xs block">
            {scores.noiseContinuity}%
          </span>
          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full"
              style={{ width: `${scores.noiseContinuity}%` }}
            />
          </div>
        </div>

        {/* Clone Probability */}
        <div className="p-2 rounded bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] font-sans text-slate-500 block truncate">
            Clone-Stamp Correlation
          </span>
          <span className="text-slate-800 font-semibold text-xs block">
            {scores.cloneProbability}%
          </span>
          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
            <div
              className="bg-red-500 h-full"
              style={{ width: `${scores.cloneProbability}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed pt-1">
        {currentCase.tamperSummary}
      </p>
    </div>
  );
};
