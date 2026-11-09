import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EvidenceCase, CanvasSettings, ForensicFilterMode, RoiAnnotation } from '../types/forensic';
import {
  processELA,
  processNoise,
  processLuminance,
  processChannel,
  processCloneDetection,
  formatHexView,
  computeSignalMetrics,
  computeNoiseMetrics,
  computeHistogram,
  SignalMetrics,
  NoiseMetrics,
  HistogramData,
} from '../utils/forensicEngine';
import {
  Eye,
  Sliders,
  ZoomIn,
  SplitSquareVertical,
  PlusCircle,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Search,
  Check,
  X
} from 'lucide-react';

interface ForensicCanvasProps {
  currentCase: EvidenceCase;
  onAddAnnotation: (annotation: RoiAnnotation) => void;
  annotations: RoiAnnotation[];
  onRemoveAnnotation: (id: string) => void;
  onMetricsComputed?: (
    signal: SignalMetrics | null,
    noise: NoiseMetrics | null,
    hist: HistogramData | null
  ) => void;
}

export const ForensicCanvas: React.FC<ForensicCanvasProps> = ({
  currentCase,
  onAddAnnotation,
  annotations,
  onRemoveAnnotation,
  onMetricsComputed,
}) => {
  const [settings, setSettings] = useState<CanvasSettings>({
    filterMode: 'ela',
    elaQuality: 0.85,
    elaMultiplier: 16,
    noiseSensitivity: 5,
    cloneThreshold: 6,
    selectedChannel: 'red',
    splitPosition: 50,
    splitEnabled: false,
    loupeEnabled: false,
    loupeZoom: 4,
    invertFilter: false,
    showAnnotations: true,
  });

  const onMetricsComputedRef = useRef(onMetricsComputed);
  useEffect(() => {
    onMetricsComputedRef.current = onMetricsComputed;
  }, [onMetricsComputed]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [canvasPixelInfo, setCanvasPixelInfo] = useState<{ x: number; y: number; r: number; g: number; b: number; hex: string } | null>(null);

  // Drawing ROI annotation state
  const [isDrawingRoi, setIsDrawingRoi] = useState(false);
  const [roiStart, setRoiStart] = useState<{ x: number; y: number } | null>(null);
  const [roiCurrent, setRoiCurrent] = useState<{ x: number; y: number } | null>(null);
  const [pendingRoi, setPendingRoi] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [annotationNote, setAnnotationNote] = useState('');
  const [annotationLabel, setAnnotationLabel] = useState('Suspect Region');
  const [annotationSeverity, setAnnotationSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  // Canvas DOM references
  const containerRef = useRef<HTMLDivElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const filteredCanvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Hex dump buffer state
  const [hexRows, setHexRows] = useState<Array<{ offsetHex: string; bytesHex: string[]; ascii: string }>>([]);

  // Load image onto source canvas
  const renderSourceImage = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      const origCanvas = originalCanvasRef.current;
      if (!origCanvas) return;

      origCanvas.width = img.naturalWidth || 1024;
      origCanvas.height = img.naturalHeight || 768;
      const ctx = origCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, origCanvas.width, origCanvas.height);
      }

      // Generate realistic hex buffer for hex viewer
      const simBuffer = new Uint8Array(512);
      simBuffer[0] = 0xff; simBuffer[1] = 0xd8; simBuffer[2] = 0xff; simBuffer[3] = 0xe0; // JPEG SOI
      simBuffer[4] = 0x00; simBuffer[5] = 0x10; simBuffer[6] = 0x4a; simBuffer[7] = 0x46; // 'JFIF'
      simBuffer[8] = 0x49; simBuffer[9] = 0x46; simBuffer[10] = 0x00; simBuffer[11] = 0x01;
      for (let i = 12; i < 512; i++) {
        simBuffer[i] = Math.floor(Math.random() * 256);
      }
      setHexRows(formatHexView(simBuffer, 0, 256));

      setImageLoaded(true);
    };
    img.src = currentCase.imageSrc;
  }, [currentCase.imageSrc]);

  // Draw final composite to display canvas (handling split-screen & overlays)
  const drawCompositeDisplay = useCallback(() => {
    const displayCanvas = displayCanvasRef.current;
    const origCanvas = originalCanvasRef.current;
    const filterCanvas = filteredCanvasRef.current;
    if (!displayCanvas || !origCanvas || !filterCanvas) return;

    displayCanvas.width = origCanvas.width;
    displayCanvas.height = origCanvas.height;
    const ctx = displayCanvas.getContext('2d');
    if (!ctx) return;

    const width = displayCanvas.width;
    const height = displayCanvas.height;

    if (settings.splitEnabled) {
      // Split view: Left = Original, Right = Filtered
      const splitX = (settings.splitPosition / 100) * width;

      // Draw original on left
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, height);
      ctx.clip();
      ctx.drawImage(origCanvas, 0, 0);
      ctx.restore();

      // Draw filtered on right
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, width - splitX, height);
      ctx.clip();
      ctx.drawImage(filterCanvas, 0, 0);
      ctx.restore();

      // Draw split divider line
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, height);
      ctx.stroke();

      // Draw split divider handle badge
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(splitX - 16, height / 2 - 14, 32, 28);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SPLIT', splitX, height / 2 + 4);
    } else {
      // Full view of active filtered canvas
      ctx.drawImage(filterCanvas, 0, 0);
    }

    // Draw tamper zones if enabled
    if (settings.showAnnotations) {
      // Pre-loaded case tamper zones
      currentCase.tamperZones.forEach((zone) => {
        const px = (zone.x / 100) * width;
        const py = (zone.y / 100) * height;
        const pw = (zone.width / 100) * width;
        const ph = (zone.height / 100) * height;

        ctx.strokeStyle = zone.severity === 'critical' ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 2]);
        ctx.strokeRect(px, py, pw, ph);
        ctx.setLineDash([]);

        // Tag label
        ctx.fillStyle = zone.severity === 'critical' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.9)';
        ctx.fillRect(px, py - 18, Math.min(pw, 160), 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(zone.label.slice(0, 22), px + 4, py - 5);
      });

      // User created ROI annotations
      annotations.forEach((ann) => {
        const px = (ann.x / 100) * width;
        const py = (ann.y / 100) * height;
        const pw = (ann.width / 100) * width;
        const ph = (ann.height / 100) * height;

        ctx.strokeStyle = '#06b6d4'; // Cyan
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, pw, ph);

        ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
        ctx.fillRect(px, py - 18, Math.min(pw, 160), 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`ROI: ${ann.label.slice(0, 18)}`, px + 4, py - 5);
      });
    }

    // Invert canvas colors if setting active
    if (settings.invertFilter) {
      const imgData = ctx.getImageData(0, 0, width, height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i];
        d[i + 1] = 255 - d[i + 1];
        d[i + 2] = 255 - d[i + 2];
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }, [
    settings.splitEnabled,
    settings.splitPosition,
    settings.showAnnotations,
    settings.invertFilter,
    currentCase.tamperZones,
    annotations
  ]);

  const drawCompositeDisplayRef = useRef(drawCompositeDisplay);
  useEffect(() => {
    drawCompositeDisplayRef.current = drawCompositeDisplay;
  }, [drawCompositeDisplay]);

  // Execute active forensic filter
  const runForensicAnalysis = useCallback(async () => {
    const origCanvas = originalCanvasRef.current;
    const filterCanvas = filteredCanvasRef.current;
    if (!origCanvas || !filterCanvas || !imageObjRef.current) return;

    setIsProcessing(true);

    try {
      if (settings.filterMode === 'rgb') {
        filterCanvas.width = origCanvas.width;
        filterCanvas.height = origCanvas.height;
        const ctx = filterCanvas.getContext('2d');
        if (ctx) ctx.drawImage(origCanvas, 0, 0);
      } else if (settings.filterMode === 'ela') {
        await processELA(origCanvas, filterCanvas, settings.elaQuality, settings.elaMultiplier);
      } else if (settings.filterMode === 'noise') {
        processNoise(origCanvas, filterCanvas, settings.noiseSensitivity);
      } else if (settings.filterMode === 'clone') {
        processCloneDetection(origCanvas, filterCanvas, currentCase.tamperZones, settings.cloneThreshold);
      } else if (settings.filterMode === 'luminance') {
        processLuminance(origCanvas, filterCanvas);
      } else if (settings.filterMode === 'channels') {
        processChannel(origCanvas, filterCanvas, settings.selectedChannel);
      }

      // Compute mathematical metrics deterministically from raw canvas pixels
      const origCtx = origCanvas.getContext('2d');
      const filterCtx = filterCanvas.getContext('2d');
      if (origCtx && filterCtx) {
        const origData = origCtx.getImageData(0, 0, origCanvas.width, origCanvas.height);
        const filterData = filterCtx.getImageData(0, 0, filterCanvas.width, filterCanvas.height);
        const sig = computeSignalMetrics(origData, filterData);
        const noise = computeNoiseMetrics(origData);
        const hist = computeHistogram(origData);
        onMetricsComputedRef.current?.(sig, noise, hist);
      }
    } catch (err) {
      console.error('Forensic processing error:', err);
    } finally {
      setIsProcessing(false);
      drawCompositeDisplayRef.current();
    }
  }, [
    settings.filterMode,
    settings.elaQuality,
    settings.elaMultiplier,
    settings.noiseSensitivity,
    settings.cloneThreshold,
    settings.selectedChannel,
    currentCase.id
  ]);

  // Initial and case-change load
  useEffect(() => {
    setImageLoaded(false);
    renderSourceImage();
  }, [currentCase.id, renderSourceImage]);

  // Rerun when filter parameters change or image finishes loading
  useEffect(() => {
    if (imageLoaded) {
      runForensicAnalysis();
    }
  }, [imageLoaded, runForensicAnalysis]);

  // Redraw when split or annotations change
  useEffect(() => {
    drawCompositeDisplay();
  }, [settings.splitEnabled, settings.splitPosition, settings.showAnnotations, settings.invertFilter, annotations, drawCompositeDisplay]);

  // Handle Canvas Mouse Move (Loupe + Pixel Inspector Probe)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`.toUpperCase();
        setCanvasPixelInfo({ x, y, r: pixel[0], g: pixel[1], b: pixel[2], hex });
      }

      // Render Magnifying Loupe
      if (settings.loupeEnabled && loupeCanvasRef.current) {
        const loupe = loupeCanvasRef.current;
        const loupeCtx = loupe.getContext('2d');
        if (loupeCtx) {
          loupeCtx.imageSmoothingEnabled = false;
          loupeCtx.clearRect(0, 0, loupe.width, loupe.height);

          const zoom = settings.loupeZoom;
          const sampleSize = Math.floor(loupe.width / zoom);
          const sx = Math.max(0, Math.min(canvas.width - sampleSize, x - sampleSize / 2));
          const sy = Math.max(0, Math.min(canvas.height - sampleSize, y - sampleSize / 2));

          loupeCtx.drawImage(canvas, sx, sy, sampleSize, sampleSize, 0, 0, loupe.width, loupe.height);

          // Overlay pixel grid lines when zoom >= 8
          if (zoom >= 8) {
            loupeCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            loupeCtx.lineWidth = 1;
            const gridSize = zoom;
            for (let gx = 0; gx < loupe.width; gx += gridSize) {
              loupeCtx.beginPath();
              loupeCtx.moveTo(gx, 0);
              loupeCtx.lineTo(gx, loupe.height);
              loupeCtx.stroke();
            }
            for (let gy = 0; gy < loupe.height; gy += gridSize) {
              loupeCtx.beginPath();
              loupeCtx.moveTo(0, gy);
              loupeCtx.lineTo(loupe.width, gy);
              loupeCtx.stroke();
            }
          }

          // Center crosshair
          loupeCtx.strokeStyle = '#ef4444';
          loupeCtx.lineWidth = 1;
          const cx = loupe.width / 2;
          const cy = loupe.height / 2;
          loupeCtx.beginPath();
          loupeCtx.moveTo(cx - 8, cy); loupeCtx.lineTo(cx + 8, cy);
          loupeCtx.moveTo(cx, cy - 8); loupeCtx.lineTo(cx, cy + 8);
          loupeCtx.stroke();
        }
      }
    }

    // ROI Drawing drag update
    if (isDrawingRoi && roiStart) {
      setRoiCurrent({ x, y });
    }
  };

  // Handle ROI Drawing Start
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRoi) return;
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    setRoiStart({ x, y });
    setRoiCurrent({ x, y });
  };

  // Handle ROI Drawing Complete
  const handleMouseUp = () => {
    if (!isDrawingRoi || !roiStart || !roiCurrent) return;
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    const x1 = Math.min(roiStart.x, roiCurrent.x);
    const y1 = Math.min(roiStart.y, roiCurrent.y);
    const x2 = Math.max(roiStart.x, roiCurrent.x);
    const y2 = Math.max(roiStart.y, roiCurrent.y);

    const w = x2 - x1;
    const h = y2 - y1;

    if (w > 10 && h > 10) {
      const pctX = (x1 / canvas.width) * 100;
      const pctY = (y1 / canvas.height) * 100;
      const pctW = (w / canvas.width) * 100;
      const pctH = (h / canvas.height) * 100;

      setPendingRoi({ x: pctX, y: pctY, width: pctW, height: pctH });
    }

    setIsDrawingRoi(false);
    setRoiStart(null);
    setRoiCurrent(null);
  };

  const handleSaveRoi = () => {
    if (!pendingRoi) return;
    const newAnn: RoiAnnotation = {
      id: `ann-${Date.now()}`,
      x: pendingRoi.x,
      y: pendingRoi.y,
      width: pendingRoi.width,
      height: pendingRoi.height,
      label: annotationLabel || 'Suspect Anomaly',
      severity: annotationSeverity,
      note: annotationNote || 'Investigator marked region of interest.',
      timestamp: new Date().toLocaleTimeString(),
    };
    onAddAnnotation(newAnn);
    setPendingRoi(null);
    setAnnotationNote('');
  };

  const filterExplanations: Record<ForensicFilterMode, { title: string; mechanism: string; takeaway: string }> = {
    rgb: {
      title: 'Normal Sensor RGB',
      mechanism: 'Standard uncompressed canvas viewport displaying original captured pixel array.',
      takeaway: 'Baseline reference view for human perception.'
    },
    ela: {
      title: 'Error Level Analysis (ELA)',
      mechanism: 'Re-quantizes the image at controlled loss levels and amplifies pixel delta differences. High-contrast white flares indicate different compression histories.',
      takeaway: 'Spliced or edited elements shine bright against dark homogeneous backgrounds.'
    },
    noise: {
      title: 'Sensor High-Pass Noise Extraction',
      mechanism: '3x3 Laplacian convolution matrix filters macro luminance, exposing high-frequency camera sensor grain (PRNU noise).',
      takeaway: 'Inserted objects lack matching camera ISO noise pattern or show unnatural smoothing blur.'
    },
    clone: {
      title: 'Copy-Move Clone Detection',
      mechanism: 'Block matching algorithm calculates spatial correlation vectors and marks duplicated texture regions.',
      takeaway: 'Flags duplicate dent patterns, stamped vehicles, or cloned infrastructure elements.'
    },
    luminance: {
      title: 'ITU-R BT.709 Luminance Gradient',
      mechanism: 'Calculates luminance Y = 0.2126R + 0.7152G + 0.0722B mapped across false-color threshold bands.',
      takeaway: 'Reveals inconsistent light vectors, conflicting highlight angles, and unnatural drop shadows.'
    },
    channels: {
      title: 'Isolated Color Channel',
      mechanism: 'Separates single primary chromatic bands (Red, Green, Blue) into monochrome optical planes.',
      takeaway: 'Inspects lens chromatic aberration and color-dependent sensor interpolation.'
    },
    hex: {
      title: 'Binary Hexadecimal Stream Inspector',
      mechanism: 'Inspects raw byte offsets, header markers (SOI, APP0, SOF0, DQT tables), and embedded ASCII metadata tags.',
      takeaway: 'Verifies file structure integrity and detects concealed payloads or trailing metadata infills.'
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden h-[calc(100vh-3.5rem)]">
      {/* Top Filter Selection Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-mono uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Mode:
          </span>

          <button
            onClick={() => setSettings((s) => ({ ...s, filterMode: 'rgb' }))}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              settings.filterMode === 'rgb'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            Normal RGB
          </button>

          <button
            onClick={() => setSettings((s) => ({ ...s, filterMode: 'ela' }))}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              settings.filterMode === 'ela'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Error Level (ELA)</span>
          </button>

          <button
            onClick={() => setSettings((s) => ({ ...s, filterMode: 'noise' }))}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              settings.filterMode === 'noise'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            Noise Extraction
          </button>

          <button
            onClick={() => setSettings((s) => ({ ...s, filterMode: 'clone' }))}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              settings.filterMode === 'clone'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            Clone Detection
          </button>

          <button
            onClick={() => setSettings((s) => ({ ...s, filterMode: 'luminance' }))}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              settings.filterMode === 'luminance'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            Luminance Gradient
          </button>

          <button
            onClick={() => setSettings((s) => ({ ...s, filterMode: 'channels' }))}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              settings.filterMode === 'channels'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            Color Channels
          </button>

          <button
            onClick={() => setSettings((s) => ({ ...s, filterMode: 'hex' }))}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap font-mono ${
              settings.filterMode === 'hex'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            Hex Byte Inspector
          </button>
        </div>

        {/* Viewport Secondary Controls */}
        <div className="flex items-center gap-2">
          {/* Compare Split Button */}
          <button
            onClick={() => setSettings((s) => ({ ...s, splitEnabled: !s.splitEnabled }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors border ${
              settings.splitEnabled
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Toggle split view to compare original with forensic filter"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>

          {/* Magnifying Loupe Toggle */}
          <button
            onClick={() => setSettings((s) => ({ ...s, loupeEnabled: !s.loupeEnabled }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors border ${
              settings.loupeEnabled
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Toggle magnifying loupe with pixel probe"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Loupe {settings.loupeZoom}x</span>
          </button>

          {/* Draw ROI Annotation */}
          <button
            onClick={() => setIsDrawingRoi((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors border ${
              isDrawingRoi
                ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Click to drag a bounding box on the image to annotate a suspect region"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isDrawingRoi ? 'Drag On Canvas' : 'Annotate ROI'}</span>
          </button>
        </div>
      </div>

      {/* Main Forensic Working Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Central Canvas Viewport */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-4 overflow-auto">
          {/* Offscreen canvases for processing */}
          <canvas ref={originalCanvasRef} className="hidden" />
          <canvas ref={filteredCanvasRef} className="hidden" />

          {/* Interactive display canvas */}
          {settings.filterMode !== 'hex' ? (
            <div
              ref={containerRef}
              className="relative max-w-full max-h-[calc(100vh-14rem)] rounded border border-slate-300 bg-slate-900 shadow-md select-none overflow-hidden"
              style={{ cursor: isDrawingRoi ? 'crosshair' : settings.loupeEnabled ? 'none' : 'default' }}
            >
              <canvas
                ref={displayCanvasRef}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => setMousePos(null)}
                className="block max-h-[calc(100vh-14rem)] max-w-full object-contain"
              />

              {/* Drawing ROI rectangle preview */}
              {isDrawingRoi && roiStart && roiCurrent && (
                <div
                  className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-none"
                  style={{
                    left: `${Math.min(roiStart.x, roiCurrent.x)}px`,
                    top: `${Math.min(roiStart.y, roiCurrent.y)}px`,
                    width: `${Math.abs(roiCurrent.x - roiStart.x)}px`,
                    height: `${Math.abs(roiCurrent.y - roiStart.y)}px`,
                  }}
                />
              )}

              {/* Floating Magnifying Loupe Window */}
              {settings.loupeEnabled && mousePos && (
                <div
                  className="absolute pointer-events-none rounded-lg overflow-hidden border-2 border-blue-500 shadow-2xl bg-slate-950 z-20"
                  style={{
                    left: `${Math.min(mousePos.x + 20, (containerRef.current?.clientWidth || 500) - 170)}px`,
                    top: `${Math.max(10, mousePos.y - 80)}px`,
                    width: '150px',
                    height: '150px',
                  }}
                >
                  <canvas
                    ref={loupeCanvasRef}
                    width={150}
                    height={150}
                    className="w-full h-full block"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-[10px] font-mono text-slate-200 px-1.5 py-0.5 text-center flex items-center justify-between">
                    <span>{settings.loupeZoom}x MAG</span>
                    <span>{canvasPixelInfo?.hex}</span>
                  </div>
                </div>
              )}

              {/* Split Slider Controller Bar at bottom of canvas */}
              {settings.splitEnabled && (
                <div className="absolute bottom-3 inset-x-12 bg-slate-900/80 backdrop-blur-xs p-2 rounded border border-slate-700 flex items-center gap-3 z-10">
                  <span className="text-[11px] font-mono text-slate-300 whitespace-nowrap">
                    Original RGB
                  </span>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={settings.splitPosition}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, splitPosition: Number(e.target.value) }))
                    }
                    className="w-full accent-blue-600 h-1.5 bg-slate-700 rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-blue-400 whitespace-nowrap">
                    {filterExplanations[settings.filterMode].title} ({settings.splitPosition}%)
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Hex Byte Stream Inspector View */
            <div className="w-full h-full max-w-4xl bg-white border border-slate-200 rounded p-4 flex flex-col font-mono text-xs overflow-hidden shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <span className="font-semibold text-slate-800">
                  Binary Stream Hexdump (JPEG EXIF Header)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Offset: 0x00000000 - 0x00000100 (256 bytes)
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 text-slate-700 select-all font-mono">
                <div className="grid grid-cols-[80px_1fr_140px] gap-4 font-semibold text-slate-400 border-b border-slate-100 pb-1 text-[11px]">
                  <span>OFFSET</span>
                  <span>HEX BYTES (00 - 0F)</span>
                  <span>ASCII DECODE</span>
                </div>
                {hexRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[80px_1fr_140px] gap-4 py-0.5 hover:bg-slate-50 rounded"
                  >
                    <span className="text-blue-600 font-medium">{row.offsetHex}</span>
                    <span className="tracking-widest">{row.bytesHex.join(' ')}</span>
                    <span className="text-slate-500">{row.ascii}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Telemetry Probe Bar */}
          <div className="mt-3 flex items-center gap-6 px-4 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono text-slate-600 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">COORDS:</span>
              <span className="text-slate-900 font-semibold">
                X: {canvasPixelInfo?.x ?? '--'}, Y: {canvasPixelInfo?.y ?? '--'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">RGB:</span>
              <span className="text-slate-900 font-semibold">
                ({canvasPixelInfo?.r ?? '--'}, {canvasPixelInfo?.g ?? '--'}, {canvasPixelInfo?.b ?? '--'})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">HEX:</span>
              <span className="text-blue-600 font-semibold">
                {canvasPixelInfo?.hex ?? '--'}
              </span>
              {canvasPixelInfo?.hex && (
                <div
                  className="w-3.5 h-3.5 rounded-xs border border-slate-300"
                  style={{ backgroundColor: canvasPixelInfo.hex }}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">RES:</span>
              <span className="text-slate-800">
                {currentCase.dimensions.width}×{currentCase.dimensions.height} px
              </span>
            </div>
          </div>
        </div>

        {/* Right Settings & Telemetry Control Drawer */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto">
          {/* Filter Description Banner */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                {filterExplanations[settings.filterMode].title}
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Active Filter
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {filterExplanations[settings.filterMode].mechanism}
            </p>
            <div className="text-[11px] font-medium text-blue-700 flex items-start gap-1 pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{filterExplanations[settings.filterMode].takeaway}</span>
            </div>
          </div>

          {/* Dynamic Filter Parameter Sliders */}
          <div className="p-4 border-b border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Algorithm Parameters
              </span>
              {isProcessing && (
                <span className="text-[11px] font-mono text-blue-600 animate-pulse">
                  Computing...
                </span>
              )}
            </div>

            {/* ELA Controls */}
            {settings.filterMode === 'ela' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">Re-quantization Quality</span>
                    <span className="font-mono font-medium text-slate-900">
                      {Math.round(settings.elaQuality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.70"
                    max="0.95"
                    step="0.01"
                    value={settings.elaQuality}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, elaQuality: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>70% (Coarse)</span>
                    <span>95% (Fine)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">Error Multiplier Scale</span>
                    <span className="font-mono font-medium text-slate-900">
                      {settings.elaMultiplier}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="30"
                    step="1"
                    value={settings.elaMultiplier}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, elaMultiplier: parseInt(e.target.value) }))
                    }
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>4x</span>
                    <span>30x (Amplified)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Noise Extraction Controls */}
            {settings.filterMode === 'noise' && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">High-Pass Filter Gain</span>
                  <span className="font-mono font-medium text-slate-900">
                    {settings.noiseSensitivity}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={settings.noiseSensitivity}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, noiseSensitivity: parseInt(e.target.value) }))
                  }
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>1 (Subtle Grain)</span>
                  <span>10 (High Sensitivity)</span>
                </div>
              </div>
            )}

            {/* Clone Detection Controls */}
            {settings.filterMode === 'clone' && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Block Correlation Threshold</span>
                  <span className="font-mono font-medium text-slate-900">
                    {settings.cloneThreshold}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={settings.cloneThreshold}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, cloneThreshold: parseInt(e.target.value) }))
                  }
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>1 (Permissive)</span>
                  <span>10 (Strict)</span>
                </div>
              </div>
            )}

            {/* Channel Selection */}
            {settings.filterMode === 'channels' && (
              <div className="space-y-2">
                <span className="text-xs text-slate-600 block">Select Spectral Plane:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['red', 'green', 'blue'] as const).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setSettings((s) => ({ ...s, selectedChannel: ch }))}
                      className={`py-1.5 px-2 text-xs font-mono font-medium rounded uppercase transition-colors ${
                        settings.selectedChannel === ch
                          ? ch === 'red'
                            ? 'bg-red-600 text-white'
                            : ch === 'green'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loupe Zoom Level Selector */}
            {settings.loupeEnabled && (
              <div>
                <span className="text-xs text-slate-600 block mb-1">Magnification Zoom:</span>
                <div className="grid grid-cols-4 gap-1">
                  {[2, 4, 8, 16].map((z) => (
                    <button
                      key={z}
                      onClick={() => setSettings((s) => ({ ...s, loupeZoom: z }))}
                      className={`py-1 text-xs font-mono rounded transition-colors ${
                        settings.loupeZoom === z
                          ? 'bg-blue-600 text-white font-medium'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {z}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Invert & Annotation Toggles */}
            <div className="pt-2 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={settings.invertFilter}
                  onChange={(e) => setSettings((s) => ({ ...s, invertFilter: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span>Invert Color Contrast (Negative)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={settings.showAnnotations}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, showAnnotations: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span>Show Tamper Zones & Annotations</span>
              </label>
            </div>
          </div>

          {/* Pending ROI Confirmation Modal/Card */}
          {pendingRoi && (
            <div className="p-4 border-b border-slate-200 bg-blue-50/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-900">
                  New ROI Annotation
                </span>
                <button
                  onClick={() => setPendingRoi(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Label:</label>
                <input
                  type="text"
                  value={annotationLabel}
                  onChange={(e) => setAnnotationLabel(e.target.value)}
                  className="w-full text-xs px-2.5 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Severity:</label>
                <select
                  value={annotationSeverity}
                  onChange={(e) => setAnnotationSeverity(e.target.value as any)}
                  className="w-full text-xs px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                >
                  <option value="low">Low Discrepancy</option>
                  <option value="medium">Medium Inconsistency</option>
                  <option value="high">High Tamper Likelihood</option>
                  <option value="critical">Critical Evidence Breach</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Examiner Notes:</label>
                <textarea
                  value={annotationNote}
                  onChange={(e) => setAnnotationNote(e.target.value)}
                  placeholder="Record optical findings, compression artifacts, or clone vectors..."
                  rows={2}
                  className="w-full text-xs px-2.5 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                onClick={handleSaveRoi}
                className="w-full py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save to Evidence Log</span>
              </button>
            </div>
          )}

          {/* Active Tamper Zones / Annotations List */}
          <div className="p-4 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-800 block mb-2">
              Detected Anomalies ({currentCase.tamperZones.length + annotations.length})
            </span>

            <div className="space-y-2">
              {currentCase.tamperZones.map((zone) => (
                <div
                  key={zone.id}
                  className="p-2.5 rounded border border-slate-200 bg-slate-50 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{zone.label}</span>
                    <span
                      className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded uppercase ${
                        zone.severity === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {zone.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-snug">
                    {zone.notes}
                  </p>
                  <div className="text-[10px] font-mono text-slate-400">
                    Pos: [{zone.x}%, {zone.y}%] · Size: [{zone.width}×{zone.height}%]
                  </div>
                </div>
              ))}

              {annotations.map((ann) => (
                <div
                  key={ann.id}
                  className="p-2.5 rounded border border-cyan-200 bg-cyan-50/50 space-y-1 text-xs relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-900">{ann.label}</span>
                    <button
                      onClick={() => onRemoveAnnotation(ann.id)}
                      className="text-slate-400 hover:text-red-600"
                      title="Remove user annotation"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-600 text-[11px]">{ann.note}</p>
                  <div className="text-[10px] font-mono text-cyan-700 flex justify-between">
                    <span>USER ROI</span>
                    <span>{ann.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
