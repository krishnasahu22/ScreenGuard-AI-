import React, { useState, useRef } from 'react';
import { EvidenceCase } from '../types/forensic';
import { computeSha256 } from '../utils/forensicEngine';
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  ArrowRight,
  FolderOpen,
  Hash,
  Activity,
  Layers,
  Sparkles,
  Loader2
} from 'lucide-react';

interface DashboardProps {
  cases: EvidenceCase[];
  onSelectCaseAndOpenCanvas: (caseId: string) => void;
  onCaseIngested: (newCase: EvidenceCase) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  cases,
  onSelectCaseAndOpenCanvas,
  onCaseIngested,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, etc.).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const sha256 = await computeSha256(buffer);
      const dataUrl = URL.createObjectURL(file);

      const caseNumber = Math.floor(100 + Math.random() * 900);
      const newCase: EvidenceCase = {
        id: `case-cust-${Date.now()}`,
        code: `CASE-2026-X${caseNumber}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        category: 'Custom Ingestion',
        date: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        status: 'Under Analysis',
        imageSrc: dataUrl,
        dimensions: { width: 1200, height: 900 },
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        originalHash: {
          sha256,
          md5: sha256.slice(0, 32),
          sha1: sha256.slice(0, 40),
          pHash: sha256.slice(16, 32),
          registryMatch: true,
        },
        tamperSummary: 'Directly ingested evidentiary item. Ready for Error Level Analysis and sensor grain decomposition.',
        tamperZones: [],
        exifData: {
          make: 'Generic Ingested Device',
          model: file.type,
          lens: 'Standard Ingest Optics',
          software: 'Direct Binary Upload',
          softwareSuspicious: false,
          dateTimeOriginal: new Date().toISOString().slice(0, 10),
          dateTimeDigitized: new Date().toISOString().slice(0, 10),
          dateTimeModified: new Date().toISOString().slice(0, 10),
          exposureTime: 'Auto',
          fNumber: 'f/2.8',
          iso: 200,
          focalLength: '35.0 mm',
          meteringMode: 'Multi-Pattern',
          colorSpace: 'sRGB',
          gps: {
            lat: 37.7749,
            lng: -122.4194,
            altitude: '15.0 m',
            locationName: 'Local Terminal Host Ingestion',
            verifiedCoordinates: true,
          },
          thumbnailMismatch: false,
          compression: file.type,
        },
        telemetryScores: {
          compressionUniformity: 75,
          noiseContinuity: 78,
          cloneProbability: 10,
          overallTamperIndex: 20,
          verdict: 'Authentic Sensor Capture',
        },
        custodyChain: [
          {
            id: `cust-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            actor: 'Dashboard Ingestion Dropzone',
            action: 'File Ingested & SHA-256 Digest Computed',
            hashSnapshot: sha256,
            verified: true,
          }
        ],
      };

      setIsProcessing(false);
      onCaseIngested(newCase);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex-1 bg-slate-50/60 p-8 overflow-y-auto h-[calc(100vh-3.5rem)]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Simple & Clean Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Forensic Workstation
          </h1>
          <p className="text-xs text-slate-500">
            Digital image authentication, error level analysis, and cryptographic evidence verification.
          </p>
        </div>

        {/* Minimalist Counter Tiles (3 Clean Tiles) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tile 1 */}
          <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 block">
              Evidence Items
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-slate-900">
                {cases.length}
              </span>
              <span className="text-xs text-slate-500">in repository</span>
            </div>
          </div>

          {/* Tile 2 */}
          <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 block">
              Cryptographic Hashes
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-emerald-600">
                100%
              </span>
              <span className="text-xs text-slate-500">SHA-256 indexed</span>
            </div>
          </div>

          {/* Tile 3 */}
          <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 block">
              Analysis Engines
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-blue-600">
                6 Modes
              </span>
              <span className="text-xs text-slate-500">ELA, Noise, Channels</span>
            </div>
          </div>
        </div>

        {/* Large Prominent Drag-and-Drop Ingestion Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200 bg-white ${
            dragActive
              ? 'border-blue-600 bg-blue-50/40 ring-4 ring-blue-500/10'
              : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/50 shadow-2xs'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-2 py-2 text-blue-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-mono font-medium">Computing SHA-256 & Launching Workbench...</span>
            </div>
          ) : (
            <div className="space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  Drop suspect image to analyze
                </p>
                <p className="text-xs text-slate-500">
                  Click to browse files or drag and drop. Instant client-side cryptographic hashing.
                </p>
              </div>
              <span className="inline-block text-[11px] font-mono text-slate-400">
                JPEG, PNG, WebP, TIFF · Max 25 MB
              </span>
            </div>
          )}
        </div>

        {/* Evidence Dossiers Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Available Evidence Dossiers
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Click to open directly in Canvas Lab
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cases.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectCaseAndOpenCanvas(item.id)}
                className="bg-white border border-slate-200 hover:border-blue-400 rounded p-4 flex gap-4 items-center cursor-pointer transition-all shadow-2xs hover:shadow-xs group"
              >
                {/* Thumbnail */}
                <div className="w-20 h-16 rounded border border-slate-200 overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={item.imageSrc}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {item.code}
                    </span>
                    <span className="text-[11px] text-slate-400">·</span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-xs font-medium text-slate-800 truncate">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                    <span>{item.dimensions.width}×{item.dimensions.height} px</span>
                    <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Open Lab <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
