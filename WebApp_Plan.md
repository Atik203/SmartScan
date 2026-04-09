# 🌐 SmartScan — Web Dashboard Development Plan

> **Stack:** Next.js 14+ (App Router) · shadcn/ui · TailwindCSS · TypeScript  
> **Purpose:** Replace the basic Flask interface with a modern, responsive web dashboard for real-time scanner monitoring, batch image processing, and LaTeX preview.

---

## 📌 Table of Contents

1. [Overview & Goals](#-overview--goals)
2. [Architecture Overview](#-architecture-overview)
3. [Project Setup](#-project-setup)
4. [Page-by-Page Breakdown](#-page-by-page-breakdown)
5. [API Routes (Backend)](#-api-routes-backend)
6. [Component Library](#-component-library)
7. [State Management & Data Flow](#-state-management--data-flow)
8. [Styling & Theme](#-styling--theme)
9. [Development Phases](#-development-phases)
10. [File Structure](#-file-structure)

---

## 🎯 Overview & Goals

### What We're Building

A **single-page web dashboard** that serves as the brain's UI for the SmartScan system. It replaces the minimal Flask `index.html` with a premium, interactive interface.

### Core Goals

| Goal | Description |
|---|---|
| **Real-Time Monitoring** | Show live scanner status, page counter, connection health |
| **Batch Processing** | Upload multiple images, process through crop → dewarp → detect → recognize |
| **Detection Gallery** | Side-by-side view: Original → Dewarped → Detected (with bounding boxes) |
| **LaTeX Preview** | Render extracted math expressions as formatted LaTeX using KaTeX |
| **System Dashboard** | Processing metrics, logs, hardware status indicators |
| **Demo-Ready** | Should look impressive for the faculty presentation |

---

## 🏗️ Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP (smartscan-web/)              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Dashboard   │  │    Batch     │  │   Gallery    │       │
│  │    Page       │  │  Processor   │  │    Page      │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                  │               │
│  ┌──────┴─────────────────┴──────────────────┴──────┐        │
│  │              API ROUTES (app/api/)                │        │
│  │  /api/upload    /api/process    /api/status       │        │
│  │  /api/detect    /api/recognize  /api/health       │        │
│  └──────────────────────┬───────────────────────────┘        │
└─────────────────────────┼────────────────────────────────────┘
                          │  HTTP / Subprocess
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              PYTHON PROCESSING ENGINE                        │
│  dl-processing-engine/                                       │
│  • crop_image()  • dewarp_image()  • detect_and_save()      │
│  • TrOCR inference  • Tesseract OCR                         │
└─────────────────────────────────────────────────────────────┘
```

### Integration Strategy

The Next.js app calls the Python processing engine via one of two approaches:

| Approach | Method | Pros | Cons |
|---|---|---|---|
| **A) Python subprocess** | Next.js API routes spawn Python scripts | Simple, no extra server | Slower cold-start |
| **B) Flask API (recommended)** | Keep Flask running as a REST API, Next.js calls it | Fast, concurrent processing | Two servers to manage |

**Recommendation:** Use **Approach B** — Run Flask on port 5000 as a processing API, and Next.js on port 3000 as the frontend. The Next.js API routes act as a proxy.

---

## 🚀 Project Setup

### Initialize the Next.js App

```bash
cd e:\PROJECT\SmartScan
npx -y create-next-app@latest smartscan-web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

### Install Dependencies

```bash
cd smartscan-web

# shadcn/ui
npx -y shadcn@latest init

# Core shadcn components
npx -y shadcn@latest add button card tabs badge separator avatar
npx -y shadcn@latest add dialog sheet dropdown-menu
npx -y shadcn@latest add input textarea label
npx -y shadcn@latest add progress skeleton
npx -y shadcn@latest add table
npx -y shadcn@latest add sidebar

# Additional packages
npm install katex               # LaTeX rendering
npm install @types/katex        # TypeScript types
npm install react-dropzone      # File drag-and-drop
npm install lucide-react        # Icon library (shadcn default)
npm install next-themes         # Dark/Light mode
npm install swr                 # Data fetching/revalidation
npm install framer-motion       # Animations
```

---

## 📄 Page-by-Page Breakdown

### Page 1: Dashboard (`/`)

**Purpose:** The landing page showing system overview and scanner status.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR  │  HEADER: SmartScan Dashboard                │
│           │─────────────────────────────────────────────│
│  📊 Dash  │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  📤 Batch │  │ Pages    │ │ Formulas │ │ Scanner  │   │
│  🖼️ Gallery│  │ Scanned  │ │ Detected │ │ Status   │   │
│  📐 LaTeX │  │   142    │ │    67    │ │ 🟢 Online│   │
│  ⚙️ System│  └──────────┘ └──────────┘ └──────────┘   │
│           │                                             │
│           │  ┌─ Recent Activity ───────────────────┐   │
│           │  │ page034-left.jpg  ✅ Processed       │   │
│           │  │ page033-right.jpg ✅ Processed       │   │
│           │  │ page033-left.jpg  🔄 Processing...   │   │
│           │  └──────────────────────────────────────┘   │
│           │                                             │
│           │  ┌─ Processing Pipeline Health ────────┐   │
│           │  │ Arduino ──── Pi ──── Laptop           │   │
│           │  │  🟢          🟢        🟢             │   │
│           │  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- `StatCard` — Animated counter cards (pages scanned, formulas found, etc.)
- `ActivityFeed` — Real-time log of processed images
- `PipelineHealth` — Connection status indicators for Arduino → Pi → Laptop
- `ProcessingChart` — Line chart showing pages processed over time

---

### Page 2: Batch Processor (`/batch`)

**Purpose:** Upload multiple book scan images and process them through the full pipeline.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR  │  HEADER: Batch Image Processor              │
│           │─────────────────────────────────────────────│
│           │  ┌─ Drop Zone ────────────────────────┐    │
│           │  │                                     │    │
│           │  │   📁 Drag & Drop Images Here        │    │
│           │  │      or click to browse              │    │
│           │  │                                     │    │
│           │  └─────────────────────────────────────┘    │
│           │                                             │
│           │  ┌─ Processing Options ───────────────┐    │
│           │  │ ☑ Crop   ☑ Dewarp   ☑ Detect       │    │
│           │  │ ☑ Recognize (LaTeX)  ☑ OCR Text    │    │
│           │  │                                     │    │
│           │  │ [▶ Start Processing]                │    │
│           │  └─────────────────────────────────────┘    │
│           │                                             │
│           │  ┌─ Progress ─────────────────────────┐    │
│           │  │ image_001.jpg  ████████████░░  80%  │    │
│           │  │ image_002.jpg  ████████░░░░░░  55%  │    │
│           │  │ image_003.jpg  ░░░░░░░░░░░░░░  0%   │    │
│           │  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- `FileDropzone` — react-dropzone with drag-and-drop file upload
- `ProcessingOptions` — Checkbox toggles for each pipeline stage
- `ProgressTracker` — Per-file progress bars with status badges
- `ProcessingButton` — Animated start/stop button

---

### Page 3: Detection Gallery (`/gallery`)

**Purpose:** Visual comparison of Original → Dewarped → Detected results.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR  │  HEADER: Detection Gallery                  │
│           │─────────────────────────────────────────────│
│           │  ┌─ page034-left.jpg ─────────────────┐    │
│           │  │ ┌──────────┐┌──────────┐┌──────────┐│   │
│           │  │ │ Original ││ Dewarped ││ Detected ││   │
│           │  │ │          ││          ││ █ boxes  ││   │
│           │  │ │          ││          ││          ││   │
│           │  │ └──────────┘└──────────┘└──────────┘│   │
│           │  └─────────────────────────────────────┘    │
│           │                                             │
│           │  ┌─ page033-right.jpg ────────────────┐    │
│           │  │ ┌──────────┐┌──────────┐┌──────────┐│   │
│           │  │ │ Original ││ Dewarped ││ Detected ││   │
│           │  │ └──────────┘└──────────┘└──────────┘│   │
│           │  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- `ImageTriple` — Three-panel comparison view (original, dewarped, detected)
- `BoundingBoxOverlay` — Interactive overlay showing detection confidence scores
- `ImageZoom` — Click to enlarge any panel
- `FilterBar` — Filter by date, detection count, confidence threshold

---

### Page 4: LaTeX Preview (`/latex`)

**Purpose:** View extracted math expressions rendered as beautiful LaTeX formulas.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR  │  HEADER: LaTeX Expression Preview           │
│           │─────────────────────────────────────────────│
│           │  ┌─ Extracted Formulas ──────────────────┐  │
│           │  │                                        │  │
│           │  │  Source: page034-left.jpg               │  │
│           │  │  ┌──────────┐  ┌──────────────────┐   │  │
│           │  │  │ 🖼️ Crop  │  │ LaTeX Code:      │   │  │
│           │  │  │ [math    │  │ \frac{x^2+y}{z}  │   │  │
│           │  │  │  image]  │  │                   │   │  │
│           │  │  └──────────┘  │ Rendered:         │   │  │
│           │  │                │    x² + y          │   │  │
│           │  │                │    ─────           │   │  │
│           │  │                │      z             │   │  │
│           │  │                └──────────────────┘   │  │
│           │  │                                        │  │
│           │  │  ─── Next Formula ────                │  │
│           │  │  ┌──────────┐  ┌──────────────────┐   │  │
│           │  │  │ 🖼️ Crop  │  │ \sum_{i=0}^{n}   │   │  │
│           │  │  └──────────┘  └──────────────────┘   │  │
│           │  └────────────────────────────────────────┘  │
│           │                                             │
│           │  [📋 Copy All LaTeX]  [📥 Download .tex]    │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- `FormulaCard` — Shows cropped math image alongside LaTeX code + KaTeX render
- `LatexEditor` — Editable LaTeX code with live preview
- `CopyButton` — One-click copy to clipboard
- `ExportButton` — Download all formulas as a `.tex` file

---

### Page 5: System Settings (`/system`)

**Purpose:** System configuration, processing logs, and health monitoring.

**Components:**
- `ConnectionPanel` — Arduino/Pi/Laptop connection status
- `LogViewer` — Scrollable processing log with filters
- `ConfigEditor` — Editable paths, thresholds, model settings
- `MetricsCards` — Average processing time, detection accuracy, throughput

---

## 🔌 API Routes (Backend)

All API routes live in `app/api/` and communicate with the Python processing engine.

```typescript
// app/api/upload/route.ts
POST /api/upload
// Accept multipart file uploads, save to public/uploads/
// Returns: { files: [{ name, path, size }] }

// app/api/process/route.ts
POST /api/process
// Body: { files: string[], options: { crop, dewarp, detect, recognize } }
// Calls Python processing pipeline (Flask API or subprocess)
// Returns: { results: [{ original, cropped, dewarped, detected, expressions }] }

// app/api/status/route.ts
GET /api/status
// Returns current processing status, queue length, recent activity

// app/api/detect/route.ts
POST /api/detect
// Run Faster R-CNN detection on a single image
// Returns: { boxes: [{x1,y1,x2,y2,confidence}], annotated_image }

// app/api/recognize/route.ts
POST /api/recognize
// Run TrOCR on a cropped math expression image
// Returns: { latex: string, confidence: number }

// app/api/health/route.ts
GET /api/health
// Check connectivity: Arduino serial, Pi SSH, model loaded
// Returns: { arduino: bool, pi: bool, model: bool, uptime: number }
```

---

## 🧩 Component Library

### Core Layout Components

| Component | Source | Purpose |
|---|---|---|
| `AppSidebar` | Custom + shadcn `sidebar` | Navigation sidebar with icons |
| `Header` | Custom | Page title + breadcrumbs + theme toggle |
| `ThemeProvider` | `next-themes` | Dark/Light mode support |

### Data Display Components

| Component | Source | Purpose |
|---|---|---|
| `StatCard` | shadcn `card` + `framer-motion` | Animated metric counters |
| `ImageTriple` | Custom | Three-panel image comparison |
| `FormulaCard` | shadcn `card` + KaTeX | Math image + LaTeX code + rendered output |
| `ActivityFeed` | Custom | Real-time log list |
| `ProgressTracker` | shadcn `progress` | Per-file processing progress |

### Interactive Components

| Component | Source | Purpose |
|---|---|---|
| `FileDropzone` | `react-dropzone` | Drag-and-drop file upload |
| `LatexEditor` | Custom `textarea` + KaTeX | Edit LaTeX with live preview |
| `ImageZoom` | shadcn `dialog` | Full-screen image viewer |
| `FilterBar` | shadcn `input` + `dropdown-menu` | Filter/sort controls |

---

## 🔄 State Management & Data Flow

### Client-Side State

Use **SWR** for server data fetching with auto-revalidation:

```typescript
// hooks/useProcessingStatus.ts
import useSWR from 'swr';

export function useProcessingStatus() {
  const { data, error, isLoading } = useSWR('/api/status', fetcher, {
    refreshInterval: 2000, // Poll every 2 seconds
  });
  return { status: data, error, isLoading };
}
```

### Server Actions (Next.js 14)

Use Server Actions for form submissions:

```typescript
// actions/process.ts
'use server'

export async function processImages(formData: FormData) {
  const files = formData.getAll('files') as File[];
  // Call Python Flask API
  const response = await fetch('http://localhost:5000/process', {
    method: 'POST',
    body: formData,
  });
  return response.json();
}
```

---

## 🎨 Styling & Theme

### Color Palette (Dark Mode Default)

```css
/* globals.css additions */
:root {
  --smartscan-primary: 220 90% 56%;     /* Electric Blue */
  --smartscan-accent: 280 85% 65%;      /* Purple Accent */
  --smartscan-success: 142 76% 36%;     /* Green */
  --smartscan-warning: 38 92% 50%;      /* Amber */
  --smartscan-destructive: 0 84% 60%;   /* Red */
}

.dark {
  --background: 224 71% 4%;             /* Deep Navy */
  --foreground: 213 31% 91%;
  --card: 224 71% 8%;
  --card-foreground: 213 31% 91%;
}
```

### Typography

```bash
# Use Inter font via Google Fonts (already default in Next.js)
# No additional setup needed for next/font
```

### Design Principles

- **Glassmorphism** for card backgrounds (`backdrop-blur-xl`)
- **Gradient accents** on active states and headers
- **Micro-animations** via Framer Motion (hover, enter, counter animations)
- **Dark mode first** — optimized for developer/lab environments
- **Responsive** — Works on laptop screens (demo) and lab monitors

---

## 📅 Development Phases

### Phase 1: Foundation (Day 1-2)

- [ ] Initialize Next.js project with TypeScript + TailwindCSS
- [ ] Install and configure shadcn/ui
- [ ] Set up `next-themes` for dark/light mode
- [ ] Build `AppSidebar` and `Header` layout
- [ ] Create the 5-page route structure
- [ ] Configure the color palette and typography

### Phase 2: Dashboard Page (Day 3-4)

- [ ] Build `StatCard` component with animated counters
- [ ] Build `ActivityFeed` component
- [ ] Build `PipelineHealth` status indicators
- [ ] Wire up `/api/status` and `/api/health` routes
- [ ] Connect to Flask API for real data

### Phase 3: Batch Processor (Day 5-6)

- [ ] Build `FileDropzone` with react-dropzone
- [ ] Build `ProcessingOptions` checkbox group
- [ ] Build `ProgressTracker` with real-time updates
- [ ] Wire up `/api/upload` and `/api/process` routes
- [ ] Test end-to-end file upload → processing → results

### Phase 4: Gallery & LaTeX (Day 7-8)

- [ ] Build `ImageTriple` comparison component
- [ ] Build `BoundingBoxOverlay` with confidence scores
- [ ] Build `FormulaCard` with KaTeX rendering
- [ ] Build `LatexEditor` with live preview
- [ ] Wire up `/api/detect` and `/api/recognize` routes

### Phase 5: Polish & Demo (Day 9-10)

- [ ] Add Framer Motion animations throughout
- [ ] System settings page
- [ ] Loading skeletons and error states
- [ ] Mobile responsiveness polish
- [ ] Demo rehearsal and final testing

---

## 📁 File Structure

```text
smartscan-web/
├── public/
│   ├── uploads/              # Uploaded images
│   ├── processed/            # Processed results
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with sidebar
│   │   ├── page.tsx          # Dashboard (/)
│   │   ├── batch/
│   │   │   └── page.tsx      # Batch Processor (/batch)
│   │   ├── gallery/
│   │   │   └── page.tsx      # Detection Gallery (/gallery)
│   │   ├── latex/
│   │   │   └── page.tsx      # LaTeX Preview (/latex)
│   │   ├── system/
│   │   │   └── page.tsx      # System Settings (/system)
│   │   ├── api/
│   │   │   ├── upload/
│   │   │   │   └── route.ts  # File upload endpoint
│   │   │   ├── process/
│   │   │   │   └── route.ts  # Processing pipeline trigger
│   │   │   ├── detect/
│   │   │   │   └── route.ts  # Faster R-CNN detection
│   │   │   ├── recognize/
│   │   │   │   └── route.ts  # TrOCR recognition
│   │   │   ├── status/
│   │   │   │   └── route.ts  # Processing queue status
│   │   │   └── health/
│   │   │       └── route.ts  # System health check
│   │   └── globals.css       # Global styles + design tokens
│   ├── components/
│   │   ├── ui/               # shadcn/ui generated components
│   │   ├── layout/
│   │   │   ├── app-sidebar.tsx
│   │   │   └── header.tsx
│   │   ├── dashboard/
│   │   │   ├── stat-card.tsx
│   │   │   ├── activity-feed.tsx
│   │   │   └── pipeline-health.tsx
│   │   ├── batch/
│   │   │   ├── file-dropzone.tsx
│   │   │   ├── processing-options.tsx
│   │   │   └── progress-tracker.tsx
│   │   ├── gallery/
│   │   │   ├── image-triple.tsx
│   │   │   ├── bounding-box-overlay.tsx
│   │   │   └── image-zoom.tsx
│   │   └── latex/
│   │       ├── formula-card.tsx
│   │       ├── latex-editor.tsx
│   │       └── export-button.tsx
│   ├── hooks/
│   │   ├── use-processing-status.ts
│   │   └── use-system-health.ts
│   ├── lib/
│   │   ├── utils.ts          # shadcn utility (cn())
│   │   ├── flask-api.ts      # Flask API client
│   │   └── katex-render.ts   # KaTeX helper functions
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── components.json           # shadcn/ui config
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## 🔗 Key Technology Links

| Technology | Version | Documentation |
|---|---|---|
| Next.js | 14+ | [nextjs.org/docs](https://nextjs.org/docs) |
| shadcn/ui | Latest | [ui.shadcn.com](https://ui.shadcn.com) |
| TailwindCSS | 3.4+ | [tailwindcss.com](https://tailwindcss.com) |
| KaTeX | 0.16+ | [katex.org](https://katex.org) |
| Framer Motion | 11+ | [framer.com/motion](https://www.framer.com/motion) |
| react-dropzone | 14+ | [react-dropzone.js.org](https://react-dropzone.js.org) |
| SWR | 2+ | [swr.vercel.app](https://swr.vercel.app) |
| next-themes | 0.3+ | [github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes) |

---

**This plan will be executed after the Python processing engine and hardware integration are complete.**
