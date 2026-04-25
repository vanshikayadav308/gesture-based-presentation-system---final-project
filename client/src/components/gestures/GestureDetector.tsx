import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// ── Pipeline constants ────────────────────────────────────────────────────────
// FRAME_THROTTLE_MS caps processing at 20fps to keep CPU load reasonable
// while still responding fast enough for natural interaction.
const FRAME_THROTTLE_MS = 50;

// Smoothing buffer: last N classified frames. Majority vote over this window
// eliminates single-frame noise and accidental gesture flicker.
const BUFFER_SIZE = 15;
const MAJORITY_COUNT = 10; // ≥10/15 frames must agree before a gesture is "stable"

// After a gesture fires, require NEUTRAL for this long before the same
// gesture can fire again. Prevents a single held pose from spamming actions.
const RESET_NEUTRAL_MS = 300;

// Hard cooldown between any NEXT/PREV action. Even if smoothing clears fast,
// this gives the user time to lower their hand between intentional inputs.
const ACTION_COOLDOWN_MS = 900;

// TOGGLE requires a deliberate hold to avoid accidental mutes mid-presentation.
const TOGGLE_HOLD_MS = 800;
const TOGGLE_COOLDOWN_MS = 2500;

interface GestureState {
  rawGesture: string;
  stableGesture: string;
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  toggleProgress: number; // 0–1 fill for the hold indicator
}

interface GestureDetectorProps {
  onGestureStateChange: (state: GestureState) => void;
  onAction: (action: "NEXT" | "PREVIOUS" | "TOGGLE") => void;
  isActive: boolean;
}

const videoConstraints = {
  width: 320,
  height: 240,
  facingMode: "user",
};

export function GestureDetector({ onGestureStateChange, onAction, isActive }: GestureDetectorProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>();

  // Refs avoid stale-closure issues inside the rAF loop
  const lastFrameTimeRef = useRef<number>(0);
  const lastLandmarksRef = useRef<any[] | null>(null);
  const isActiveRef = useRef(isActive);
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);

  // Rolling gesture buffer and persistent state shared across frames
  const gestureBufferRef = useRef<string[]>([]);
  const stateRef = useRef({
    lastActionTime: 0,
    lastToggleTime: 0,
    lastStableGesture: "NEUTRAL",
    lastTriggeredGesture: "NEUTRAL",
    neutralSince: null as number | null,
    toggleStartTime: null as number | null,
  });

  // ── Geometry helpers ──────────────────────────────────────────────────────

  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const normDist = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    scale: number
  ) => dist(a, b) / scale;

  // ── Per-frame prediction loop ─────────────────────────────────────────────

  const predictWebcam = useCallback(() => {
    if (!handLandmarkerRef.current || !webcamRef.current?.video) {
      requestRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const now = Date.now();
    // Throttle to ~20fps
    if (now - lastFrameTimeRef.current < FRAME_THROTTLE_MS) {
      requestRef.current = requestAnimationFrame(predictWebcam);
      return;
    }
    lastFrameTimeRef.current = now;

    const video = webcamRef.current.video;
    if (!video.currentTime || video.paused || video.ended) {
      requestRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const result = handLandmarkerRef.current.detectForVideo(video, performance.now());

    // ── Confidence scoring ────────────────────────────────────────────────
    // Three independent signals are combined into a single confidence tier:
    //   1. Presence  — is a hand detected at all?
    //   2. Scale     — is the hand close enough to be reliably tracked?
    //                  (wrist-to-middle-MCP distance < 0.08 normalised = too small)
    //   3. Jitter    — did landmarks move by an implausibly large amount in one frame?
    //                  (normalised by hand scale to be distance-invariant)
    // Any single failing signal downgrades to LOW; otherwise HIGH ≥ 0.12, else MEDIUM.

    let rawGesture = "NEUTRAL";
    let confidenceLevel: "HIGH" | "MEDIUM" | "LOW" = "HIGH";
    let scale = 0;

    if (!result.landmarks || result.landmarks.length === 0) {
      // No hand in frame
      confidenceLevel = "LOW";
      rawGesture = "LOW_CONFIDENCE";
    } else {
      const hand = result.landmarks[0]; // single-hand mode
      scale = dist(hand[0], hand[9]); // wrist → middle-MCP

      if (scale < 0.08) {
        // Hand too small — landmark positions unreliable
        confidenceLevel = "LOW";
        rawGesture = "LOW_CONFIDENCE";
      } else {
        // Jitter check: large inter-frame movement at this scale = motion blur / fast wave
        if (lastLandmarksRef.current) {
          const totalMove = hand.reduce(
            (acc, pt, i) => acc + dist(pt, lastLandmarksRef.current![i]),
            0
          );
          const normMove = totalMove / hand.length / scale;
          if (normMove > 0.25) confidenceLevel = "LOW";
        }

        if (confidenceLevel !== "LOW") {
          // Graduated confidence based on hand proximity
          confidenceLevel = scale >= 0.12 ? "HIGH" : "MEDIUM";
        }
      }

      lastLandmarksRef.current = hand;

      // ── Gesture classification ──────────────────────────────────────────
      // Scale-invariant finger extension test:
      //   A finger is "extended" when its tip is farther from the wrist
      //   than its PIP joint by a margin of 0.10 (normalised by hand scale).
      //   Using wrist distance rather than knuckle-angle makes this robust
      //   to hand rotation and different hand sizes.

      if (confidenceLevel !== "LOW") {
        const wrist = hand[0];
        const isExt = (tipIdx: number, pipIdx: number) =>
          normDist(hand[tipIdx], wrist, scale) > normDist(hand[pipIdx], wrist, scale) + 0.10;

        const idxExt   = isExt(8,  6);  // index finger
        const midExt   = isExt(12, 10); // middle finger
        const ringExt  = isExt(16, 14); // ring finger
        const pinkyExt = isExt(20, 18); // pinky finger

        // Map finger combinations to gesture labels
        if (idxExt && midExt && ringExt && pinkyExt)        rawGesture = "NEXT";     // open palm
        else if (!idxExt && !midExt && !ringExt && !pinkyExt) rawGesture = "PREVIOUS"; // closed fist
        else if (idxExt && midExt && !ringExt && !pinkyExt)  rawGesture = "TOGGLE";   // peace sign
        else                                                   rawGesture = "NEUTRAL";
      } else {
        rawGesture = "NEUTRAL";
      }
    }

    // ── Majority-vote smoothing buffer ────────────────────────────────────
    // Each frame's classification is pushed into a fixed-size rolling buffer.
    // A gesture only becomes "stable" when it holds the majority (≥10/15 frames).
    // This rejects brief mis-classifications and single-frame noise without
    // introducing noticeable lag — at 20fps the buffer spans ~750ms.

    const buffer = gestureBufferRef.current;
    buffer.push(rawGesture);
    if (buffer.length > BUFFER_SIZE) buffer.shift();

    const counts: Record<string, number> = {};
    buffer.forEach((g) => { counts[g] = (counts[g] || 0) + 1; });

    let stableGesture = "NEUTRAL";
    let maxCount = 0;
    for (const g in counts) {
      if (counts[g] > maxCount) { maxCount = counts[g]; stableGesture = g; }
    }
    if (maxCount < MAJORITY_COUNT) stableGesture = "NEUTRAL";

    // ── Action triggering logic ───────────────────────────────────────────
    // To fire, ALL three guards must pass simultaneously:
    //   1. Listening is ON (user has not muted gesture input)
    //   2. The stable gesture just *transitioned in* (rising-edge only —
    //      avoids holding a pose firing repeatedly)
    //   3. The action cooldown has elapsed (prevents accidental double-fires
    //      from smoothing lag when lowering the hand)
    //
    // For TOGGLE we additionally require a deliberate hold (TOGGLE_HOLD_MS)
    // because accidentally silencing gesture input mid-presentation is disruptive.

    const S = stateRef.current;

    // Track how long we've been continuously in NEUTRAL
    if (stableGesture === "NEUTRAL") {
      if (S.neutralSince === null) S.neutralSince = now;
    } else {
      S.neutralSince = null;
    }

    let toggleProgress = 0;

    if (isActiveRef.current) {
      if (stableGesture === "NEXT" || stableGesture === "PREVIOUS") {
        const hasTransitioned  = stableGesture !== S.lastStableGesture;
        const cooldownClear    = now - S.lastActionTime > ACTION_COOLDOWN_MS;

        if (hasTransitioned && cooldownClear) {
          onAction(stableGesture as "NEXT" | "PREVIOUS");
          S.lastActionTime      = now;
          S.lastTriggeredGesture = stableGesture;
        }
      }
    }

    // TOGGLE works regardless of isActive (so user can re-enable a muted system)
    if (stableGesture === "TOGGLE") {
      if (S.toggleStartTime === null) S.toggleStartTime = now;
      const held = now - S.toggleStartTime;
      toggleProgress = Math.min(held / TOGGLE_HOLD_MS, 1);

      if (held >= TOGGLE_HOLD_MS && now - S.lastToggleTime > TOGGLE_COOLDOWN_MS) {
        onAction("TOGGLE");
        S.lastToggleTime   = now;
        S.toggleStartTime  = null;
        toggleProgress     = 0;
      }
    } else {
      S.toggleStartTime = null;
      toggleProgress    = 0;
    }

    S.lastStableGesture = stableGesture;

    // Propagate full state to parent for HUD rendering
    onGestureStateChange({ rawGesture, stableGesture, confidenceLevel, toggleProgress });

    requestRef.current = requestAnimationFrame(predictWebcam);
  }, [onGestureStateChange, onAction]);

  // ── Model initialisation ──────────────────────────────────────────────────

  useEffect(() => {
    const loadModel = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        // Prefer GPU for lower latency; fall back to CPU if the delegate is unavailable
        // (e.g., some browsers on Linux disable WebGL for security reasons).
        const baseOptions = {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        };

        try {
          handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { ...baseOptions, delegate: "GPU" },
            runningMode: "VIDEO",
            numHands: 1,
          });
        } catch {
          console.warn("[GestureDetector] GPU delegate unavailable — falling back to CPU.");
          handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { ...baseOptions, delegate: "CPU" },
            runningMode: "VIDEO",
            numHands: 1,
          });
        }

        setIsModelLoading(false);
      } catch (err) {
        console.error("[GestureDetector] Failed to load HandLandmarker:", err);
        setModelError(true);
        setIsModelLoading(false);
      }
    };

    loadModel();
  }, []);

  // Start/stop the rAF loop when model is ready
  useEffect(() => {
    if (isModelLoading) return;
    requestRef.current = requestAnimationFrame(predictWebcam);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isModelLoading, predictWebcam]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Card className="relative overflow-hidden w-[200px] h-[150px] bg-black/50 border-white/10 shadow-2xl backdrop-blur-sm">
      {isModelLoading && !modelError && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-black/80 z-20">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-xs font-mono">Loading Model...</span>
        </div>
      )}
      {modelError && (
        <div className="absolute inset-0 flex items-center justify-center text-red-400 bg-black/80 z-20 p-3">
          <span className="text-[10px] font-mono text-center leading-relaxed">
            Camera / model failed.<br />Use keyboard ← → Space.
          </span>
        </div>
      )}
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored={true}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-300"
      />
      <div className="absolute bottom-2 right-2 flex items-center space-x-2 z-10">
        <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
        <span className="text-[10px] uppercase font-mono text-white/80 tracking-widest">
          {isActive ? "LIVE" : "OFF"}
        </span>
      </div>
    </Card>
  );
}
