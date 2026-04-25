# Known Limitations

This document provides an honest engineering evaluation of the current prototype's limitations. These are acknowledged as part of the project's scope and reflect deliberate trade-offs made during development.

---

## 1. Single-Hand Detection Only
The MediaPipe Hand Landmarker is configured with `numHands: 1`. The system cannot distinguish or process two hands simultaneously. This was a deliberate scope decision — multi-hand gestures introduce ambiguity and significantly increase classification complexity. For a single-user presentation control scenario, one hand is sufficient.

## 2. PDF Format Only
Presentation files must be exported to PDF before use. PowerPoint (.pptx), Keynote (.key), and Google Slides formats are not natively supported. This is a constraint of the `react-pdf` / PDF.js rendering library used in the browser. A production version would add server-side conversion (e.g. LibreOffice headless or the Google Slides API).

## 3. Lighting Sensitivity
Recognition accuracy degrades in poor or uneven lighting conditions. The system applies no adaptive preprocessing (e.g. histogram equalisation or brightness normalisation) to the webcam feed. Users should ensure even, front-facing light for reliable detection. This is a known limitation of RGB-only landmark detection without depth data.

## 4. GPU Delegate Dependency
The system attempts to use the browser's WebGL GPU acceleration for MediaPipe. On some Linux configurations, Firefox instances with WebGL disabled, or older hardware, this fails silently. A CPU fallback is implemented in `GestureDetector.tsx`, but CPU mode runs at reduced frame throughput (~10–15fps vs ~30fps on GPU), which increases smoothing buffer latency.

## 5. No Automated Test Suite
Gesture recognition accuracy was validated through manual testing during development. No unit tests, integration tests, or automated regression suite is included. The gesture classification pipeline (finger extension logic, majority-vote buffer, confidence scoring) would benefit from a labelled test dataset and automated accuracy benchmarking in future work.

## 6. No Persistent Storage or Session History
The system is entirely client-side with no backend in the current deployed configuration. There is no persistent session logging, user preferences, or gesture event history across page refreshes. This was a deliberate simplification for the prototype — the architecture supports adding a backend (the Express server and Drizzle schema are scaffolded in the repo) if persistent analytics are needed.

## 7. Single-Page PDF Rendering
Only one page is rendered at a time. There is no slide overview, thumbnail strip, or jump-to-page navigation. These were scoped out to keep the interface focused on gesture interaction as the primary research contribution.

## 8. No Mobile Support
The system requires a desktop or laptop browser. Mobile browsers have inconsistent WebRTC camera permission behaviour and limited WebAssembly performance for running the MediaPipe WASM binary at useful frame rates.

---

*These limitations are documented to support honest evaluation and to identify clear directions for future development.*
