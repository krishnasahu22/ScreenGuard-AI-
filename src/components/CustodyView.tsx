import React, { useState } from 'react';
import { EvidenceCase, CustodyRecord } from '../types/forensic';
import { History, ShieldCheck, UserCheck, Plus, Check, Clock, FileKey, Copy } from 'lucide-react';

interface CustodyViewProps {
  currentCase: EvidenceCase;
  onAddCustodyRecord: (record: CustodyRecord) => void;
}

export const CustodyView: React.FC<CustodyViewProps> = ({
  currentCase,
  onAddCustodyRecord,
}) => {
  const [newActor, setNewActor] = useState('');
  const [newAction, setNewAction] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActor || !newAction) return;

    const record: CustodyRecord = {
      id: `cust-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: newActor,
      action: newAction,
      hashSnapshot: currentCase.originalHash.sha256,
      verified: true,
    };

    onAddCustodyRecord(record);
    setNewActor('');
    setNewAction('');
    setShowAddForm(false);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="flex-1 bg-slate-100 p-6 overflow-y-auto h-[calc(100vh-3.5rem)]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Summary */}
        <div className="bg-white border border-slate-200 rounded p-5 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Chain of Custody Audit Trail
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Compliant with Federal Rules of Evidence Rule 901 (Authenticating Evidence) and ISO/IEC 27037 standards.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Append Custody Transfer</span>
          </button>
        </div>

        {/* Append Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreateRecord}
            className="bg-blue-50/60 border border-blue-200 rounded p-4 space-y-3"
          >
            <h4 className="text-xs font-semibold text-blue-900">
              Record New Evidence Transfer or Action
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">
                  Responsible Examiner / Agent:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Det. Sarah Connor (Cyber Unit)"
                  value={newActor}
                  onChange={(e) => setNewActor(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1">
                  Action Performed:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Extracted ELA artifacts for trial exhibit"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Sign & Append to Ledger
              </button>
            </div>
          </form>
        )}

        {/* Timeline Events */}
        <div className="bg-white border border-slate-200 rounded p-6 shadow-2xs space-y-6">
          <div className="relative border-l-2 border-blue-200 ml-4 space-y-8 pl-6">
            {currentCase.custodyChain.map((entry, idx) => (
              <div key={entry.id} className="relative group">
                {/* Timeline Node Icon */}
                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-blue-600 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      {entry.action}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Examiner: <strong className="text-slate-800">{entry.actor}</strong></span>
                  </div>

                  {/* Cryptographic hash snapshot at that moment */}
                  <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-mono text-slate-600">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileKey className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="text-[11px] text-slate-400">HASH SNAPSHOT:</span>
                      <span className="truncate max-w-sm font-medium text-slate-800">
                        {entry.hashSnapshot}
                      </span>
                    </div>

                    <button
                      onClick={() => copyHash(entry.hashSnapshot)}
                      className="text-slate-400 hover:text-slate-700 shrink-0 ml-2"
                      title="Copy hash snapshot"
                    >
                      {copiedHash === entry.hashSnapshot ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
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
