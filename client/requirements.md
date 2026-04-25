## Packages
react-pdf | Render PDF documents in the browser
react-webcam | Webcam component for gesture input
@mediapipe/tasks-vision | Machine learning for hand gesture recognition
framer-motion | Smooth UI animations and HUD transitions

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["var(--font-sans)"],
  mono: ["var(--font-mono)"],
  display: ["var(--font-display)"],
}

Integration:
- MediaPipe tasks vision requires loading WASM binaries. We will use the CDN method via FilesetResolver.
- react-pdf requires setting the worker source. We will use the unpkg CDN for simplicity in this build.
