import React, { useState } from 'react';
import { EvidenceCase } from '../types/forensic';
import { Camera, MapPin, AlertOctagon, CheckCircle2, Clock, Cpu, FileSpreadsheet, Copy, Check } from 'lucide-react';

interface ExifInspectorProps {
  currentCase: EvidenceCase;
}

export const ExifInspector: React.FC<ExifInspectorProps> = ({ currentCase }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const exif = currentCase.exifData;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isDateMismatched = exif.dateTimeOriginal !== exif.dateTimeModified;

  return (
    <div className="flex-1 bg-slate-100 p-6 overflow-y-auto h-[calc(100vh-3.5rem)]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Alert Banner if Software Suspicious */}
        {exif.softwareSuspicious ? (
          <div className="bg-red-50 border border-red-200 rounded p-4 flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-red-900 uppercase tracking-wide">
                Exif Software Provenance Anomaly Flagged
              </h4>
              <p className="text-xs text-red-700 leading-relaxed">
                Metadata tags confirm image re-encoding through desktop photo manipulation software:{' '}
                <span className="font-mono font-bold">{exif.software}</span>. Original camera RAW pipeline has been disrupted.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
                Camera Firmware Pipeline Clean
              </h4>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Internal software header matches official manufacturer firmware: <span className="font-mono font-medium">{exif.software}</span>.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Optical Hardware & Exposure Profile */}
          <div className="bg-white border border-slate-200 rounded p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Camera className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                Camera & Optical Profile
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">Make:</span>
                <span className="text-slate-900 font-medium">{exif.make}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">Model:</span>
                <span className="text-slate-900 font-medium">{exif.model}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">Lens:</span>
                <span className="text-slate-900 font-medium text-right line-clamp-1">{exif.lens}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">Exposure Time:</span>
                <span className="text-slate-900">{exif.exposureTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">Aperture:</span>
                <span className="text-slate-900">{exif.fNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">ISO Sensitivity:</span>
                <span className="text-slate-900 font-semibold">{exif.iso}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">Focal Length:</span>
                <span className="text-slate-900">{exif.focalLength}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-sans">Color Space:</span>
                <span className="text-slate-900">{exif.colorSpace}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Timestamp & Chronology Analysis */}
          <div className="bg-white border border-slate-200 rounded p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                Temporal Chronology Audit
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-sans text-slate-500 block">DateTimeOriginal (Sensor Clock):</span>
                <span className="text-slate-900 font-semibold block">{exif.dateTimeOriginal}</span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-sans text-slate-500 block">DateTimeDigitized:</span>
                <span className="text-slate-900 block">{exif.dateTimeDigitized}</span>
              </div>

              <div className={`p-2.5 rounded border space-y-1 ${
                isDateMismatched ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-sans text-slate-500">DateTimeModified:</span>
                  {isDateMismatched && (
                    <span className="text-[10px] uppercase font-sans font-semibold text-amber-700">
                      Late Alteration
                    </span>
                  )}
                </div>
                <span className={`block font-semibold ${isDateMismatched ? 'text-amber-900' : 'text-slate-900'}`}>
                  {exif.dateTimeModified}
                </span>
              </div>

              <div className="pt-2 text-xs font-sans text-slate-500 leading-relaxed">
                {isDateMismatched
                  ? '⚠️ Timestamp disparity detected: Modified timestamp occurs after original capture, indicating post-processing disk re-write.'
                  : '✓ Timestamps are chronologically synchronous with single write event.'}
              </div>
            </div>
          </div>

          {/* Card 3: Geolocation Telemetry */}
          <div className="bg-white border border-slate-200 rounded p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                GPS Coordinate Telemetry
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">Latitude:</span>
                <span className="text-slate-900 font-semibold">{exif.gps.lat.toFixed(6)}° N</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">Longitude:</span>
                <span className="text-slate-900 font-semibold">{exif.gps.lng.toFixed(6)}° W</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">Altitude:</span>
                <span className="text-slate-900">{exif.gps.altitude}</span>
              </div>
              <div className="py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans block mb-1">Location Label:</span>
                <span className="text-slate-900 font-sans font-medium block">{exif.gps.locationName}</span>
              </div>

              {/* Map Coordinate Visual Radar Box */}
              <div className="h-28 rounded border border-slate-200 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                {/* Radar Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px]" />
                <div className="absolute w-16 h-16 rounded-full border border-blue-500/30" />
                <div className="absolute w-24 h-24 rounded-full border border-blue-500/20" />
                <div className="relative z-10 flex flex-col items-center">
                  <MapPin className="w-6 h-6 text-red-500 animate-bounce" />
                  <span className="text-[10px] text-blue-300 font-mono mt-1">
                    {exif.gps.lat.toFixed(4)}, {exif.gps.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => copyText(`${exif.gps.lat},${exif.gps.lng}`, 'gps')}
                className="w-full py-1.5 text-xs font-sans text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedKey === 'gps' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedKey === 'gps' ? 'Coordinates Copied' : 'Copy GPS Decimal Format'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Technical Structure & Thumbnail Discrepancy Banner */}
        <div className="bg-white border border-slate-200 rounded p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                Low-Level Bitstream & Thumbnail Parity
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Compression: {exif.compression}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-sans text-slate-500 block">Thumbnail Discrepancy Status:</span>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${exif.thumbnailMismatch ? 'text-red-600' : 'text-emerald-600'}`}>
                  {exif.thumbnailMismatch ? 'PARITY FAILURE: Thumbnail diverges from Full Frame' : 'PARITY VERIFIED: Embedded thumbnail matches image'}
                </span>
              </div>
              <p className="text-[11px] font-sans text-slate-500 pt-1 leading-normal">
                {exif.thumbnailMismatch
                  ? 'The embedded EXIF thumbnail retains the unedited original scene, proving the primary frame was modified after camera ingestion.'
                  : 'Embedded thumbnail resolution and color histogram match master frame.'}
              </p>
            </div>

            <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-sans text-slate-500 block">Quantization Matrix Integrity:</span>
              <span className="font-semibold text-slate-800">
                {exif.softwareSuspicious ? 'DQT Table Mismatch (Photoshop standard table)' : 'DQT Table Sensor Native (In-Camera Quantization)'}
              </span>
              <p className="text-[11px] font-sans text-slate-500 pt-1 leading-normal">
                Luminance quantization coefficients match software re-compression rather than Sony/Canon camera processor firmware.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
