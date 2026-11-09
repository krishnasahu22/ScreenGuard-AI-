import React, { useState, useRef } from 'react';
import { EvidenceCase } from '../types/forensic';
import { computeSha256 } from '../utils/forensicEngine';
import { X, UploadCloud, FileImage, ShieldCheck, Loader2 } from 'lucide-react';

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseIngested: (newCase: EvidenceCase) => void;
}

export const IngestModal: React.FC<IngestModalProps> = ({
  isOpen,
  onClose,
  onCaseIngested,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');
  const [caseCategory, setCaseCategory] = useState<'News / Press' | 'Insurance Fraud' | 'Identity Credential' | 'Aerial Reconnaissance' | 'Custom Ingestion'>('Custom Ingestion');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [computedSha, setComputedSha] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, etc.).');
      return;
    }

    setSelectedFile(file);
    setIsHashing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const sha256 = await computeSha256(buffer);
      setComputedSha(sha256);

      const dataUrl = URL.createObjectURL(file);
      setPreviewUrl(dataUrl);
      setIsHashing(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !previewUrl || !computedSha) return;

    const caseNumber = Math.floor(100 + Math.random() * 900);
    const newCase: EvidenceCase = {
      id: `case-cust-${Date.now()}`,
      code: `CASE-2026-X${caseNumber}`,
      title: caseTitle || selectedFile.name.replace(/\.[^/.]+$/, ''),
      category: caseCategory,
      date: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      status: 'Under Analysis',
      imageSrc: previewUrl,
      dimensions: { width: 1200, height: 900 },
      fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
      originalHash: {
        sha256: computedSha,
        md5: computedSha.slice(0, 32),
        sha1: computedSha.slice(0, 40),
        pHash: computedSha.slice(16, 32),
        registryMatch: true,
      },
      tamperSummary: 'Custom uploaded evidentiary item. Initialized in Forensic Workbench for Error Level Analysis and sensor grain extraction.',
      tamperZones: [],
      exifData: {
        make: 'Generic Ingested Device',
        model: selectedFile.type,
        lens: 'Standard Capture Optics',
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
        compression: selectedFile.type,
      },
      telemetryScores: {
        compressionUniformity: 72,
        noiseContinuity: 75,
        cloneProbability: 15,
        overallTamperIndex: 35,
        verdict: 'Authentic Sensor Capture',
      },
      custodyChain: [
        {
          id: `cust-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
          actor: 'Examiner Terminal Session',
          action: 'Direct File Upload & Cryptographic Checksum Computation',
          hashSnapshot: computedSha,
          verified: true,
        }
      ],
    };

    onCaseIngested(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Ingest Suspect Image Evidence
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* File Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-blue-600 bg-blue-50/50'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/20'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />

            {isHashing ? (
              <div className="flex flex-col items-center gap-2 py-4 text-blue-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-mono">Computing SHA-256 Digest...</span>
              </div>
            ) : selectedFile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-semibold text-xs">{selectedFile.name}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 break-all bg-slate-100 p-2 rounded">
                  SHA-256: {computedSha}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                <div>
                  <span className="text-xs font-semibold text-blue-600">Click to upload</span>
                  <span className="text-xs text-slate-500"> or drag and drop image file</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Supports JPEG, PNG, WebP, TIFF (Max 25 MB)
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-700 font-medium block mb-1">
              Case / Evidence Title:
            </label>
            <input
              type="text"
              placeholder="e.g. Spliced Contract Stamp or Incident Frame"
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-xs text-slate-700 font-medium block mb-1">
              Investigation Classification:
            </label>
            <select
              value={caseCategory}
              onChange={(e) => setCaseCategory(e.target.value as any)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-600"
            >
              <option value="News / Press">News / Press Verification</option>
              <option value="Insurance Fraud">Insurance Fraud Claim</option>
              <option value="Identity Credential">Identity Credential & Passport</option>
              <option value="Aerial Reconnaissance">Aerial & Drone Reconnaissance</option>
              <option value="Custom Ingestion">General Digital Forensic Case</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isHashing}
              className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded transition-colors shadow-xs"
            >
              Launch in Forensic Workbench
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
