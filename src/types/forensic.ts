export interface TamperZone {
  id: string;
  label: string;
  x: number; // percentage 0-100
  y: number;
  width: number;
  height: number;
  type: 'splicing' | 'clone_stamp' | 'ela_discrepancy' | 'metadata_spoof' | 'infill';
  severity: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
}

export interface ExifData {
  make: string;
  model: string;
  lens: string;
  software: string;
  softwareSuspicious: boolean;
  dateTimeOriginal: string;
  dateTimeDigitized: string;
  dateTimeModified: string;
  exposureTime: string;
  fNumber: string;
  iso: number;
  focalLength: string;
  meteringMode: string;
  colorSpace: string;
  gps: {
    lat: number;
    lng: number;
    altitude: string;
    locationName: string;
    verifiedCoordinates: boolean;
  };
  thumbnailMismatch: boolean;
  compression: string;
}

export interface CustodyRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  hashSnapshot: string;
  verified: boolean;
}

export interface EvidenceCase {
  id: string;
  code: string;
  title: string;
  category: 'News / Press' | 'Insurance Fraud' | 'Identity Credential' | 'Aerial Reconnaissance' | 'Custom Ingestion';
  date: string;
  status: 'Under Analysis' | 'Confirmed Tampered' | 'Integrity Verified' | 'Flagged Inconsistent';
  imageSrc: string;
  dimensions: { width: number; height: number };
  fileSize: string;
  originalHash: {
    sha256: string;
    md5: string;
    sha1: string;
    pHash: string;
    registryMatch: boolean;
    expectedSha256?: string;
  };
  tamperSummary: string;
  tamperZones: TamperZone[];
  exifData: ExifData;
  telemetryScores: {
    compressionUniformity: number; // 0-100%
    noiseContinuity: number; // 0-100%
    cloneProbability: number; // 0-100%
    overallTamperIndex: number; // 0-100%
    verdict: 'High Likelihood of Manipulation' | 'Authentic Sensor Capture' | 'Suspect Metadata Splicing' | 'Structural Infill Detected';
  };
  custodyChain: CustodyRecord[];
}

export type ForensicFilterMode = 'rgb' | 'ela' | 'noise' | 'clone' | 'luminance' | 'channels' | 'hex';

export interface RoiAnnotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  note: string;
  timestamp: string;
}

export interface CanvasSettings {
  filterMode: ForensicFilterMode;
  elaQuality: number; // 0.70 to 0.95
  elaMultiplier: number; // 1 to 30
  noiseSensitivity: number; // 1 to 10
  cloneThreshold: number; // 1 to 10
  selectedChannel: 'red' | 'green' | 'blue';
  splitPosition: number; // 0 to 100
  splitEnabled: boolean;
  loupeEnabled: boolean;
  loupeZoom: number; // 2, 4, 8, 16
  invertFilter: boolean;
  showAnnotations: boolean;
}
