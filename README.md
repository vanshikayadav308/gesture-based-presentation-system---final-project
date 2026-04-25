
# Gesture-Controlled Presentation Navigation System

**Final Year Project — BSc Computer Science, 2025–26**  
**Author:** Vanshika Yadav  
**Supervisor:** Prashanth Thattai Ravikumar  
**GitHub:** https://github.com/vanshikayadav308/gesture-presentation-system-final-prototype

---

## What It Does

A browser-based prototype that lets users navigate PDF presentations using hand gestures captured through a standard webcam. The system uses MediaPipe's hand landmark model to classify gestures in real time and maps them to slide navigation commands — no keyboard, mouse, or specialised hardware required.

---

## Core Features Implemented

- Real-time hand gesture detection via MediaPipe Tasks Vision (Hand Landmarker)
- Three gesture commands: Open Palm (next slide), Closed Fist (previous slide), Peace Sign (toggle listening — hold 800ms)
- PDF upload — load any PDF file directly in the browser; sample PDF pre-loaded for immediate testing
- Keyboard fallback — `→` next slide, `←` previous slide, `Space` toggle listening (works globally, does not interfere with input fields)
- Manual nav buttons — always-visible Prev / Next buttons as a third fallback input method
- Gesture smoothing pipeline — 15-frame majority-vote buffer eliminates single-frame noise and false triggers
- Confidence gating — three-signal scoring (landmark presence, hand scale, inter-frame jitter); only HIGH/MEDIUM confidence gestures trigger actions
- Action cooldown — 900ms cooldown on NEXT/PREV, 2500ms on TOGGLE, preventing accidental repeated firing
- System HUD — live display of raw gesture, stable gesture, confidence level, and toggle-hold progress
- Event log panel — timestamped log of all gesture detections and actions, including input source (gesture vs keyboard)
- GPU → CPU fallback — attempts GPU delegate for MediaPipe; automatically retries with CPU if unavailable

---

## Setup & Run Instructions

### Prerequisites

- Node.js v18 or higher (`node --version` to check)
- npm v9 or higher
- A modern browser — **Chrome or Edge strongly recommended** (required for WebGL/GPU acceleration; CPU fallback available but slower)
- A webcam (built-in or USB)
- Internet connection on first load (MediaPipe model ~8MB downloaded from CDN once, then cached)

### Step 1 — Clone or unzip the project

```bash
git clone https://github.com/vanshikayadav308/gesture-presentation-system-final-prototype.git
cd gesture-presentation-system-final-prototype
```

Or unzip the submitted archive and `cd` into the project folder.

### Step 2 — Install dependencies

Run this from the **project root** (the folder containing `package.json`) — not from inside `client/`:

```bash
npm install
```

This installs all frontend and server dependencies in one step.

### Step 3 — Start the development server

```bash
npm run dev
```

The terminal will print the local URL — typically `http://localhost:5000`. Open that URL in Chrome or Edge.

### Step 4 — Allow camera access

When the browser prompts for camera permission, click **Allow**. Gesture detection requires webcam access. If you accidentally deny it, click the camera icon in the browser address bar to reset permissions and reload.

### Step 5 — Launch the demo

Click **"Launch Demo"** or **"Try the Prototype"** on the landing page. The sample PDF loads automatically and gesture listening starts immediately.

---

## Test Credentials & Sample Inputs

**No login or authentication is required.** The system has no user accounts or backend database in its current configuration.

**Sample PDF:** A 3-page sample presentation is pre-loaded from `/client/public/sample.pdf` — no upload needed for initial testing.

**To test with your own PDF:** Click the **"Upload PDF"** button in the bottom-left of the presentation view and select any `.pdf` file from your machine.

**To test gestures manually (no webcam needed):** Use the always-visible **← Prev / Next →** buttons in the top-right of the presentation view, or keyboard shortcuts `←` `→` `Space`.

### Gesture test inputs

| Input | Expected output |
|---|---|
| 🖐 Open Palm held for ~15 frames (~750ms) | Slide advances to next page |
| ✊ Closed Fist held for ~15 frames | Slide goes to previous page |
| ✌️ Peace Sign held for 800ms | Gesture listening toggles ON/OFF |
| `→` arrow key | Slide advances (keyboard fallback) |
| `←` arrow key | Slide goes back (keyboard fallback) |
| `Space` | Toggles gesture listening (keyboard fallback) |
| Open Palm on last slide | Blocked — event log shows "Already on last slide" |
| Closed Fist on first slide | Blocked — event log shows "Already on first slide" |

### Measured response latency

Manual timing during development testing: gesture-to-slide response measured at approximately **120–180ms** under good lighting with GPU delegate active. This falls within the ≤200ms target specified in the project brief. Latency increases to ~250–350ms on CPU fallback mode.

---

## Known Limitations

- **Single-hand detection only** — the MediaPipe model is configured for one hand (`numHands: 1`). Multi-hand gestures are out of scope.
- **PDF format only** — PowerPoint, Keynote, and Google Slides files are not supported. Export to PDF before use. This is a constraint of the PDF.js rendering library.
- **Lighting sensitivity** — recognition degrades in poor or uneven lighting. No adaptive preprocessing is applied. Front-facing, even light gives best results.
- **GPU delegate dependency** — best performance requires WebGL/GPU acceleration in Chrome or Edge. CPU fallback is implemented but reduces frame throughput from ~30fps to ~10–15fps, increasing smoothing buffer lag.
- **No automated test suite** — gesture accuracy was validated through manual testing. No unit or integration tests are included.
- **No persistent storage** — the system runs entirely client-side. No session history, user accounts, or server-side logging. The Express server in the repo is scaffolding only; the presentation view does not depend on it.
- **Backend scoped out** — the original design proposed a FastAPI/Flask backend for session management. This was deliberately removed in favour of a fully client-side architecture to simplify deployment and eliminate server-side dependencies for a prototype submission.
- **No pointer/laser gesture** — annotation and pointer modes described in the project proposal were scoped out. Only slide navigation commands are implemented.
- **No mobile support** — requires a desktop or laptop browser. Mobile WebRTC camera permissions and WebAssembly performance are inconsistent across devices.

---

## Gesture Recognition — Technical Summary

The `GestureDetector` component processes webcam frames at 20fps (50ms throttle). For each frame:

1. **MediaPipe Hand Landmarker** returns 21 normalised 3D landmarks for the detected hand.
2. **Confidence scoring** uses three signals: landmark presence, hand scale (wrist-to-middle-MCP distance < 0.08 = too small), and inter-frame jitter normalised by scale. Any failing signal downgrades confidence to LOW.
3. **Finger extension** is determined by comparing each fingertip's normalised distance from the wrist against its PIP joint distance with a 0.10 margin threshold — scale-invariant across different hand sizes.
4. **Majority-vote buffer** — classified frames are pushed into a 15-frame rolling window. A gesture requires ≥10/15 frames of agreement to become "stable". At 20fps this spans ~750ms, balancing noise rejection with response speed.
5. **Rising-edge trigger** — actions fire only when the stable gesture *transitions in* (not while held), combined with a cooldown check. This prevents a held pose from spamming repeated actions.

---

## Project Structure

```
gesture-presentation-system/
├── package.json                  # Root — all dependencies and npm scripts
├── README.md                     # This file
├── LIMITATIONS.md                # Extended limitations discussion
├── server/
│   ├── index.ts                  # Express server entry point
│   └── assets/
│       └── sample_presentation_3_pages.pdf
├── client/
│   ├── public/
│   │   └── sample.pdf            # Built-in sample presentation (3 slides)
│   └── src/
│       ├── App.tsx               # Root router (Wouter)
│       ├── pages/
│       │   ├── Home.tsx          # Landing page
│       │   └── PresentationView.tsx  # Main demo view — owns all navigation state
│       └── components/
│           ├── gestures/
│           │   └── GestureDetector.tsx  # MediaPipe pipeline + gesture classification
│           └── presentation/
│               ├── PDFViewer.tsx        # Responsive PDF renderer (react-pdf)
│               ├── SystemHUD.tsx        # Real-time gesture status overlay
│               └── EventLog.tsx         # Collapsible timestamped event log
└── shared/
    └── schema.ts                 # Shared TypeScript types
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript (Vite) |
| Gesture recognition | MediaPipe Tasks Vision (`@mediapipe/tasks-vision@0.10.0`) |
| PDF rendering | `react-pdf` (PDF.js) |
| Webcam access | `react-webcam` |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | Wouter |
| Animations | Framer Motion |

---

## Dependencies

All dependencies are declared in `package.json` (root). Key packages:

```
react                     ^18
typescript                ^5
@mediapipe/tasks-vision   ^0.10.0
react-pdf                 ^10
react-webcam              ^7
framer-motion             ^11
tailwindcss               ^3
wouter                    ^3
```

Install all with:

```bash
npm install
```

---

## License

Produced as a Final Year Project submission for academic assessment purposes.  
© 2025–26 Vanshika Yadav — BSc Computer Science, Goldsmiths, University of London
