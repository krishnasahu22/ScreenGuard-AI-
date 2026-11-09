import React, { useState } from 'react';
import { EvidenceCase } from '../types/forensic';
import { ShieldCheck, ShieldAlert, Copy, Check, Hash, Fingerprint } from 'lucide-react';

interface HashVerificationPanelProps {
  currentCase: EvidenceCase;
}

export const HashVerificationPanel: React.FC<HashVerificationPanelProps> = ({ currentCase }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const hash = currentCase.originalHash;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-white border-t border-slate-200 px-6 py-3 shrink-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Verification Status Banner */}
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
              hash.registryMatch
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {hash.registryMatch ? (
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            ) : (
              <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                Cryptographic Integrity Certificate
              </span>
              <span
                className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded uppercase ${
                  hash.registryMatch
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {hash.registryMatch ? 'Registry Matched' : 'Signature Inconsistency'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {hash.registryMatch
                ? 'Current file hash exactly matches original master evidence record in secure storage.'
                : 'Digest mismatch: Current byte sequence diverges from original registered hash digest.'}
            </p>
          </div>
        </div>

        {/* Hashes Grid */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* SHA-256 */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded">
            <span className="text-slate-400 font-sans text-[11px]">SHA-256:</span>
            <span className="text-slate-800 font-medium select-all truncate max-w-[150px] lg:max-w-[200px]" title={hash.sha256}>
              {hash.sha256.slice(0, 16)}...{hash.sha256.slice(-6)}
            </span>
            <button
              onClick={() => copyToClipboard(hash.sha256, 'sha256')}
              className="text-slate-400 hover:text-slate-700 ml-1"
              title="Copy full SHA-256"
            >
              {copiedKey === 'sha256' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* MD5 */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded">
            <span className="text-slate-400 font-sans text-[11px]">MD5:</span>
            <span className="text-slate-800 select-all" title={hash.md5}>
              {hash.md5}
            </span>
            <button
              onClick={() => copyToClipboard(hash.md5, 'md5')}
              className="text-slate-400 hover:text-slate-700 ml-1"
              title="Copy MD5"
            >
              {copiedKey === 'md5' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Perceptual Hash (pHash) */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded">
            <span className="text-slate-400 font-sans text-[11px]">pHash:</span>
            <span className="text-blue-700 font-medium select-all">
              {hash.pHash}
            </span>
            <button
              onClick={() => copyToClipboard(hash.pHash, 'phash')}
              className="text-slate-400 hover:text-slate-700 ml-1"
              title="Copy pHash"
            >
              {copiedKey === 'phash' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
