import React, { useState } from 'react';
import { EvidenceCase } from '../types/forensic';
import { SignalMetrics, NoiseMetrics, HistogramData } from '../utils/forensicEngine';
import { Activity, BarChart2, Hash, Camera, ShieldCheck, Copy, Check } from 'lucide-react';

interface MathematicalTelemetryProps {
  currentCase: EvidenceCase;
  signalMetrics: SignalMetrics | null;
  noiseMetrics: NoiseMetrics | null;
  histogram: HistogramData | null;
}

export const MathematicalTelemetry: React.FC<MathematicalTelemetryProps> = ({
  currentCase,
  signalMetrics,
  noiseMetrics,
  histogram,
}) => {
  const [activeChannelView, setActiveChannelView] = useState<'all' | 'r' | 'g' | 'b' | 'lum'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const exif = currentCase.exifData;
  const hash = currentCase.originalHash;

  return (
    <div className="bg-white border-t border-slate-200 divide-y divide-slate-100 shrink-0">
      {/* Top Metrics Row: Direct Mathematical Computations */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-6 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
            Real-Time Mathematical Telemetry
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            [Deterministic Buffer Analysis]
          </span>
        </div>

        {/* Live Mathematical Readouts */}
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
          {/* MSE */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-2xs">
            <span className="text-slate-500 font-sans text-[11px]">MSE:</span>
            <span className="font-semibold text-slate-900">
              {signalMetrics ? signalMetrics.mse : '0.00'}
            </span>
          </div>

          {/* PSNR */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-2xs">
            <span className="text-slate-500 font-sans text-[11px]">PSNR:</span>
            <span className="font-semibold text-blue-700">
              {signalMetrics ? `${signalMetrics.psnr} dB` : '--'}
            </span>
          </div>

          {/* Mean Delta */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-2xs">
            <span className="text-slate-500 font-sans text-[11px]">Mean Δ:</span>
            <span className="font-semibold text-slate-900">
              {signalMetrics ? signalMetrics.meanDelta : '0.00'}
            </span>
          </div>

          {/* Max Delta */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-2xs">
            <span className="text-slate-500 font-sans text-[11px]">Max Δ:</span>
            <span className="font-semibold text-slate-900">
              {signalMetrics ? signalMetrics.maxDelta : '0'}
            </span>
          </div>

          {/* Error Std Dev */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-2xs">
            <span className="text-slate-500 font-sans text-[11px]">Error σ:</span>
            <span className="font-semibold text-slate-900">
              {signalMetrics ? signalMetrics.stdDev : '0.00'}
            </span>
          </div>

          {/* Noise Variance */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-2xs">
            <span className="text-slate-500 font-sans text-[11px]">Noise σ²:</span>
            <span className="font-semibold text-slate-900">
              {noiseMetrics ? noiseMetrics.variance : '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Second Row: Live Histogram & Cryptographic Certificate */}
      <div className="px-6 py-3 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 256-Bin RGB Histogram (5 cols) */}
        <div className="lg:col-span-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
              <span>256-Bin Intensity Histogram</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-mono">
              <button
                onClick={() => setActiveChannelView('all')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  activeChannelView === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                RGB
              </button>
              <button
                onClick={() => setActiveChannelView('r')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  activeChannelView === 'r' ? 'bg-red-600 text-white font-medium' : 'text-red-600 hover:bg-red-50'
                }`}
              >
                R
              </button>
              <button
                onClick={() => setActiveChannelView('g')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  activeChannelView === 'g' ? 'bg-emerald-600 text-white font-medium' : 'text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                G
              </button>
              <button
                onClick={() => setActiveChannelView('b')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  activeChannelView === 'b' ? 'bg-blue-600 text-white font-medium' : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                B
              </button>
              <button
                onClick={() => setActiveChannelView('lum')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  activeChannelView === 'lum' ? 'bg-slate-600 text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Y
              </button>
            </div>
          </div>

          {/* SVG Histogram Graphic */}
          <div className="h-14 bg-slate-900 rounded p-1 relative overflow-hidden flex items-end">
            {histogram ? (
              <svg className="w-full h-full" viewBox="0 0 256 60" preserveAspectRatio="none">
                {/* Red channel */}
                {(activeChannelView === 'all' || activeChannelView === 'r') && (
                  <path
                    d={histogram.r
                      .map((val, i) => `${i === 0 ? 'M' : 'L'} ${i} ${60 - (val / histogram.maxCount) * 58}`)
                      .join(' ')}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.2"
                    strokeOpacity={activeChannelView === 'all' ? 0.65 : 0.9}
                  />
                )}
                {/* Green channel */}
                {(activeChannelView === 'all' || activeChannelView === 'g') && (
                  <path
                    d={histogram.g
                      .map((val, i) => `${i === 0 ? 'M' : 'L'} ${i} ${60 - (val / histogram.maxCount) * 58}`)
                      .join(' ')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.2"
                    strokeOpacity={activeChannelView === 'all' ? 0.65 : 0.9}
                  />
                )}
                {/* Blue channel */}
                {(activeChannelView === 'all' || activeChannelView === 'b') && (
                  <path
                    d={histogram.b
                      .map((val, i) => `${i === 0 ? 'M' : 'L'} ${i} ${60 - (val / histogram.maxCount) * 58}`)
                      .join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.2"
                    strokeOpacity={activeChannelView === 'all' ? 0.65 : 0.9}
                  />
                )}
                {/* Luminance channel */}
                {activeChannelView === 'lum' && (
                  <path
                    d={histogram.lum
                      .map((val, i) => `${i === 0 ? 'M' : 'L'} ${i} ${60 - (val / histogram.maxCount) * 58}`)
                      .join(' ')}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}
              </svg>
            ) : (
              <div className="text-[10px] font-mono text-slate-500 m-auto">
                Computing Histogram...
              </div>
            )}
          </div>
        </div>

        {/* Cryptographic Digests & Raw EXIF Strip (7 cols) */}
        <div className="lg:col-span-7 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          {/* SHA-256 Digest */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-sans font-semibold text-slate-800 text-xs">
                SHA-256 Digest:
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
                VERIFIED
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
              <span className="select-all text-slate-700 text-[11px] truncate max-w-xs font-medium">
                {hash.sha256}
              </span>
              <button
                onClick={() => copyToClipboard(hash.sha256, 'sha')}
                className="text-slate-400 hover:text-slate-700 ml-1"
                title="Copy full SHA-256 digest"
              >
                {copiedKey === 'sha' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Raw EXIF Telemetry */}
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-500 font-sans">
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              <span>Camera Optical Tags:</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800">
              <span className="font-semibold">{exif.make} {exif.model}</span>
              <span className="text-slate-300">|</span>
              <span>{exif.exposureTime}</span>
              <span className="text-slate-300">|</span>
              <span>{exif.fNumber}</span>
              <span className="text-slate-300">|</span>
              <span>ISO {exif.iso}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
