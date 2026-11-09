import React, { useState } from 'react';
import { INITIAL_CASES } from './data/forensicCases';
import { EvidenceCase, RoiAnnotation, CustodyRecord } from './types/forensic';
import { SignalMetrics, NoiseMetrics, HistogramData } from './utils/forensicEngine';
import { Header } from './components/Header';
import { CaseSidebar } from './components/CaseSidebar';
import { ForensicCanvas } from './components/ForensicCanvas';
import { ExifInspector } from './components/ExifInspector';
import { CustodyView } from './components/CustodyView';
import { MathematicalTelemetry } from './components/MathematicalTelemetry';
import { Dashboard } from './components/Dashboard';
import { ReportModal } from './components/ReportModal';
import { IngestModal } from './components/IngestModal';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Hash,
  Binary
} from 'lucide-react';

export default function App() {
  const [cases, setCases] = useState<EvidenceCase[]>(INITIAL_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string>(INITIAL_CASES[0].id);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'canvas' | 'exif' | 'custody'>('dashboard');
  const [annotationsByCase, setAnnotationsByCase] = useState<Record<string, RoiAnnotation[]>>({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);

  const [signalMetrics, setSignalMetrics] = useState<SignalMetrics | null>(null);
  const [noiseMetrics, setNoiseMetrics] = useState<NoiseMetrics | null>(null);
  const [histogram, setHistogram] = useState<HistogramData | null>(null);

  const handleMetricsComputed = React.useCallback((
    sig: SignalMetrics | null,
    noise: NoiseMetrics | null,
    hist: HistogramData | null
  ) => {
    setSignalMetrics(sig);
    setNoiseMetrics(noise);
    setHistogram(hist);
  }, []);

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];
  const activeAnnotations = annotationsByCase[activeCase.id] || [];

  const handleAddAnnotation = (annotation: RoiAnnotation) => {
    setAnnotationsByCase((prev) => ({
      ...prev,
      [activeCase.id]: [...(prev[activeCase.id] || []), annotation],
    }));
  };

  const handleRemoveAnnotation = (id: string) => {
    setAnnotationsByCase((prev) => ({
      ...prev,
      [activeCase.id]: (prev[activeCase.id] || []).filter((a) => a.id !== id),
    }));
  };

  const handleAddCustodyRecord = (record: CustodyRecord) => {
    setCases((prev) =>
      prev.map((item) =>
        item.id === activeCase.id
          ? { ...item, custodyChain: [record, ...item.custodyChain] }
          : item
      )
    );
  };

  const handleCaseIngested = (newCase: EvidenceCase) => {
    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    setActiveTab('canvas');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col text-[#191c1e]">
      {/* Top Bar Contract (3 zones) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenIngest={() => setIsIngestModalOpen(true)}
        activeCaseCode={activeCase.code}
      />

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Canvas Lab View */}
        {activeTab === 'canvas' && (
          <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)]">
            <div className="flex-1 flex overflow-hidden">
              <CaseSidebar
                cases={cases}
                activeCaseId={activeCaseId}
                onSelectCase={(id) => setActiveCaseId(id)}
                onOpenIngest={() => setIsIngestModalOpen(true)}
              />
              <ForensicCanvas
                currentCase={activeCase}
                onAddAnnotation={handleAddAnnotation}
                annotations={activeAnnotations}
                onRemoveAnnotation={handleRemoveAnnotation}
                onMetricsComputed={handleMetricsComputed}
              />
            </div>
            {/* Deterministic Mathematical Telemetry Dock */}
            <MathematicalTelemetry
              currentCase={activeCase}
              signalMetrics={signalMetrics}
              noiseMetrics={noiseMetrics}
              histogram={histogram}
            />
          </div>
        )}

        {/* Simple & Clean Dashboard View (Default Landing) */}
        {activeTab === 'dashboard' && (
          <Dashboard
            cases={cases}
            onSelectCaseAndOpenCanvas={(caseId) => {
              setActiveCaseId(caseId);
              setActiveTab('canvas');
            }}
            onCaseIngested={handleCaseIngested}
          />
        )}

        {/* EXIF Telemetry Tab */}
        {activeTab === 'exif' && (
          <div className="flex-1 flex overflow-hidden">
            <CaseSidebar
              cases={cases}
              activeCaseId={activeCaseId}
              onSelectCase={(id) => setActiveCaseId(id)}
              onOpenIngest={() => setIsIngestModalOpen(true)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <ExifInspector currentCase={activeCase} />
              <MathematicalTelemetry
                currentCase={activeCase}
                signalMetrics={signalMetrics}
                noiseMetrics={noiseMetrics}
                histogram={histogram}
              />
            </div>
          </div>
        )}

        {/* Chain of Custody Tab */}
        {activeTab === 'custody' && (
          <div className="flex-1 flex overflow-hidden">
            <CaseSidebar
              cases={cases}
              activeCaseId={activeCaseId}
              onSelectCase={(id) => setActiveCaseId(id)}
              onOpenIngest={() => setIsIngestModalOpen(true)}
            />
            <CustodyView
              currentCase={activeCase}
              onAddCustodyRecord={handleAddCustodyRecord}
            />
          </div>
        )}
      </main>

      {/* Official Court-Admissible Report Export Modal */}
      <ReportModal
        currentCase={activeCase}
        annotations={activeAnnotations}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Custom Evidence Upload Modal */}
      <IngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onCaseIngested={handleCaseIngested}
      />
    </div>
  );
}
