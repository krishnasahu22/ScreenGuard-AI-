# Simple & Clean Forensic Dashboard

A minimalist, spacious, and low-information dashboard designed as the primary entry point to the forensic workstation. It provides essential overview counts, a prominent drag-and-drop evidence ingestion zone, and direct one-click launch into the Canvas Lab without visual noise or data overload.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural plan implements the two user preferences confirmed during clarification:
> - **Dashboard Features**: Minimalist counter tiles (Total Evidence, Verified Registries, Active Analyses) paired with a large, clean drag-and-drop ingestion zone.
> - **Navigation Integration**: Set `dashboard` as the default landing view upon application start, featuring direct jump links into the Canvas Lab.

- **Confirmed Decision 1**: The dashboard will adhere strictly to a low-information, high-clarity philosophy (clean whitespace, quiet typography, zero cluttered stat widgets or speculative scores).
- **Confirmed Decision 2**: The prominent dropzone allows instant file drag-and-drop right from the dashboard, computing the cryptographic SHA-256 digest on the fly and immediately navigating to the Canvas Lab with the new evidence pre-loaded.
- **Confirmed Decision 3**: The top navigation will include: `Dashboard` (default), `Canvas Lab`, `EXIF Telemetry`, and `Chain of Custody`.

---

## 1. Overview & Core Concept

- **What It Does**: Serves as the welcoming, clean home cockpit of the forensic workstation. Analysts can view core evidence counts at a glance, immediately drop a new suspect photo to analyze, or click on any existing evidence item to open the interactive Canvas Lab.
- **Target Experience**: Fast, quiet, professional, and unencumbered by dense tables or technical clutter until the user explicitly enters the Canvas Lab.

---

## 2. User Experience & Visual Design

### Key Dashboard Sections

1. **Quiet Header & Workspace Status**: Clean title "Forensic Workstation Overview" with quiet laboratory session metadata.
2. **Minimalist Counter Tiles (3–4 clean cards)**:
   - Total Evidence Items (`4 Cases`)
   - Cryptographic Checksums (`100% SHA-256 Verified`)
   - Active Ingestions (`Ready for Analysis`)
3. **Prominent Drag-and-Drop Ingestion Zone**:
   - Clean, generously padded dropzone with dashed border and subtle hover state.
   - Accepts any image file, computes SHA-256 via Web Crypto API in milliseconds, and directly switches view to the Canvas Lab.
4. **Recent Evidence Dossiers Grid**:
   - 4 clean, uncluttered cards showing image thumbnail, Case ID (e.g. `CASE-2026-F89`), title, file size, and a prominent `"Open in Canvas Lab →"` button.

---

## 3. Technical Architecture & Component Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│ Top Bar: [Dashboard] — [Canvas Lab] — [EXIF Telemetry] — [Custody]     │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Simple & Clean Dashboard View (Default Landing)                        │
│ ────────────────────────────────────────────────────────────────────── │
│ ┌───────────────┐ ┌──────────────────────┐ ┌─────────────────────────┐ │
│ │ 4 Evidence    │ │ SHA-256 Verified     │ │ Session: Active         │ │
│ └───────────────┘ └──────────────────────┘ └─────────────────────────┘ │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │  [Drag and Drop Suspect Evidence File Here or Click to Browse]     │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │  Evidence Dossiers (4 Minimal Cards with "Open in Canvas" actions) │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Verification Plan

- **Compilation**: Co-execute `compile_applet` and `lint_applet` to verify zero TypeScript errors.
- **Interactive Ingestion**: Test dragging a file onto the dashboard dropzone and verifying automatic navigation to the Canvas Lab with the new evidence active.
- **Navigation Flow**: Verify seamless switching between Dashboard, Canvas Lab, EXIF Telemetry, and Chain of Custody.
