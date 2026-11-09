import React from 'react';
import { EvidenceCase, RoiAnnotation } from '../types/forensic';
import { X, Printer, Download, ShieldCheck, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';

interface ReportModalProps {
  currentCase: EvidenceCase;
  annotations: RoiAnnotation[];
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  currentCase,
  annotations,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const reportData = {
      reportTitle: 'Forensic Digital Image Authenticity Examination Report',
      generatedAt: new Date().toISOString(),
      caseDetails: {
        code: currentCase.code,
        title: currentCase.title,
        category: currentCase.category,
        fileDimensions: currentCase.dimensions,
        fileSize: currentCase.fileSize,
      },
      cryptographicSignatures: currentCase.originalHash,
      exifAnalysis: currentCase.exifData,
      anomalyScoring: currentCase.telemetryScores,
      detectedTamperZones: currentCase.tamperZones,
      examinerAnnotations: annotations,
      chainOfCustody: currentCase.custodyChain,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCase.code}_Forensic_Report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isTampered = currentCase.status === 'Confirmed Tampered';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Action Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Forensic Examination Dossier Export
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-900 font-sans print:p-0">
          {/* Official Document Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="text-[11px] font-mono tracking-widest uppercase text-slate-500">
                OFFICIAL FORENSIC LABORATORY EXAMINATION CERTIFICATE
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
                Digital Image Integrity & Authenticity Analysis
              </h1>
              <div className="text-xs font-mono text-slate-500 mt-1">
                CASE IDENTIFIER: <span className="font-bold text-slate-900">{currentCase.code}</span> · CLASSIFICATION: {currentCase.category}
              </div>
            </div>

            <div className="text-right font-mono text-xs text-slate-500 space-y-0.5">
              <div>REPORT NO: FR-{currentCase.code.replace('CASE-', '')}-2026</div>
              <div>DATE: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              <div>EXAMINER: FORENSIC INVESTIGATOR #4092</div>
            </div>
          </div>

          {/* Section 1: Executive Forensic Verdict Banner */}
          <div className={`p-4 rounded border flex items-start justify-between gap-4 ${
            isTampered ? 'bg-red-50/80 border-red-200' : 'bg-emerald-50/80 border-emerald-200'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isTampered ? (
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                )}
                <span className="font-bold text-sm tracking-wide text-slate-900 uppercase">
                  FINAL OPINION: {currentCase.telemetryScores.verdict}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {currentCase.tamperSummary}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] font-mono uppercase text-slate-500">OPTICAL STATUS</div>
              <div className={`text-base font-mono font-bold uppercase ${isTampered ? 'text-red-600' : 'text-emerald-600'}`}>
                {isTampered ? 'ANOMALIES PRESENT' : 'UNALTERED'}
              </div>
            </div>
          </div>

          {/* Section 2: Cryptographic Checksum Certificate */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              1. Evidence Ingestion & Cryptographic Checksums
            </h3>
            <table className="w-full text-xs font-mono border border-slate-200">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-2 text-left font-semibold">ALGORITHM</th>
                  <th className="p-2 text-left font-semibold">RECORDED DIGEST</th>
                  <th className="p-2 text-left font-semibold">REGISTRY STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-semibold">SHA-256</td>
                  <td className="p-2 break-all">{currentCase.originalHash.sha256}</td>
                  <td className="p-2 font-semibold text-emerald-700">AUTHENTICATED INGESTION</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">MD5</td>
                  <td className="p-2">{currentCase.originalHash.md5}</td>
                  <td className="p-2 font-semibold text-emerald-700">VERIFIED</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Perceptual (pHash)</td>
                  <td className="p-2">{currentCase.originalHash.pHash}</td>
                  <td className="p-2 font-semibold text-blue-700">COMPUTED HAMMING SEED</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Evidence Image & Detected Tamper Zones */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              2. Optical Anomaly Breakdown & Tamper Zones
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Evidence Thumbnail */}
              <div className="border border-slate-200 rounded p-2 bg-slate-50 space-y-2">
                <img
                  src={currentCase.imageSrc}
                  alt={currentCase.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto rounded object-cover"
                />
                <div className="text-[10px] font-mono text-slate-500 text-center">
                  EXHIBIT A: {currentCase.code} ({currentCase.dimensions.width}×{currentCase.dimensions.height}px)
                </div>
              </div>

              {/* Tamper Zones Table */}
              <div className="md:col-span-2 space-y-2">
                <table className="w-full text-xs font-mono border border-slate-200">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-1.5 text-left">ZONE</th>
                      <th className="p-1.5 text-left">TYPE</th>
                      <th className="p-1.5 text-left">SEVERITY</th>
                      <th className="p-1.5 text-left">FINDINGS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentCase.tamperZones.map((zone) => (
                      <tr key={zone.id}>
                        <td className="p-1.5 font-semibold text-slate-900">{zone.label}</td>
                        <td className="p-1.5 uppercase text-slate-600">{zone.type}</td>
                        <td className="p-1.5 font-bold text-red-600 uppercase">{zone.severity}</td>
                        <td className="p-1.5 font-sans text-slate-700">{zone.notes}</td>
                      </tr>
                    ))}
                    {annotations.map((ann) => (
                      <tr key={ann.id} className="bg-cyan-50/40">
                        <td className="p-1.5 font-semibold text-cyan-900">{ann.label}</td>
                        <td className="p-1.5 uppercase text-cyan-700">EXAMINER ROI</td>
                        <td className="p-1.5 font-bold uppercase text-amber-600">{ann.severity}</td>
                        <td className="p-1.5 font-sans text-slate-700">{ann.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 4: Metadata & Chronology Audit */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. Telemetry & Sensor EXIF Analysis
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2 border border-slate-100 bg-slate-50 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">Camera Hardware</span>
                <span className="font-semibold text-slate-900">{currentCase.exifData.make} {currentCase.exifData.model}</span>
              </div>
              <div className="p-2 border border-slate-100 bg-slate-50 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">Software Stamp</span>
                <span className={`font-semibold ${currentCase.exifData.softwareSuspicious ? 'text-red-600' : 'text-slate-900'}`}>
                  {currentCase.exifData.software}
                </span>
              </div>
              <div className="p-2 border border-slate-100 bg-slate-50 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">Capture Timestamp</span>
                <span className="text-slate-900">{currentCase.exifData.dateTimeOriginal}</span>
              </div>
              <div className="p-2 border border-slate-100 bg-slate-50 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">GPS Geolocation</span>
                <span className="text-slate-900">{currentCase.exifData.gps.lat.toFixed(4)}, {currentCase.exifData.gps.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Section 5: Signature & Verification Block */}
          <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs font-mono">
            <div>
              <div className="text-[10px] uppercase text-slate-500">EXAMINER ATTESTATION</div>
              <p className="font-sans text-slate-600 text-[11px] mt-1 leading-relaxed">
                I hereby certify under penalty of perjury that the algorithmic tests (Error Level Analysis, high-pass noise decomposition, and block matching) were conducted in accordance with scientific digital forensic protocols.
              </p>
              <div className="mt-4 pt-2 border-b border-slate-400 font-bold text-slate-900">
                Dr. E. Vance, PhD, D-ABFDE
              </div>
              <div className="text-[10px] text-slate-500">Senior Forensic Examiner</div>
            </div>

            <div>
              <div className="text-[10px] uppercase text-slate-500">EVIDENTIARY HASH SEAL</div>
              <div className="p-2.5 bg-slate-100 border border-slate-200 rounded mt-1 space-y-1">
                <div className="text-[10px] text-slate-500">SEALED DOSSIER HASH:</div>
                <div className="text-[10px] font-bold text-blue-900 break-all">
                  {currentCase.originalHash.sha256}
                </div>
                <div className="text-[9px] text-slate-400">
                  TIMESTAMP: {new Date().toISOString()} · CHAIN BLOCK #48102
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
