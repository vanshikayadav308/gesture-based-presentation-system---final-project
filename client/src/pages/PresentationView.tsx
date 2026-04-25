import { GestureDetector } from "@/components/gestures/GestureDetector";
import { SystemHUD } from "@/components/presentation/SystemHUD";
import { EventLog } from "@/components/presentation/EventLog";
import { PDFViewer } from "@/components/presentation/PDFViewer";
import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Keyboard } from "lucide-react";
import { Link } from "wouter";

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: "info" | "success" | "warning";
}

// Bundled sample PDF — works with no backend required
const SAMPLE_PDF_URL = "/sample.pdf";

export default function PresentationView() {
  // --- PDF State ---
  const [pdfUrl, setPdfUrl] = useState<string>(SAMPLE_PDF_URL);
  const [pdfTitle, setPdfTitle] = useState<string>("Sample Presentation");
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);

  // Refs so keyboard/gesture callbacks always read the latest values (avoids stale closures)
  const pageNumberRef = useRef(1);
  const numPagesRef = useRef<number | null>(null);

  // --- System State ---
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isListening, setIsListening] = useState(true);
  const isListeningRef = useRef(true);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [gestureState, setGestureState] = useState({
    rawGesture: "NEUTRAL",
    stableGesture: "NEUTRAL",
    confidenceLevel: "HIGH" as "HIGH" | "MEDIUM" | "LOW",
    toggleProgress: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        message,
        type,
      },
      ...prev.slice(0, 29),
    ]);
  }, []);

  // ── Core action handler (shared by gestures + keyboard) ──────────────────

  const handleAction = useCallback(
    (action: "NEXT" | "PREVIOUS" | "TOGGLE", source: "gesture" | "keyboard" = "gesture") => {
      const page = pageNumberRef.current;
      const total = numPagesRef.current;

      if (action === "NEXT") {
        if (total && page >= total) {
          addLog("Already on last slide", "warning");
          return;
        }
        const next = page + 1;
        pageNumberRef.current = next;
        setPageNumber(next);
        setLastAction("✓ Next");
        addLog(`NEXT [${source}] → Page ${next}`, "success");
      } else if (action === "PREVIOUS") {
        if (page <= 1) {
          addLog("Already on first slide", "warning");
          return;
        }
        const next = page - 1;
        pageNumberRef.current = next;
        setPageNumber(next);
        setLastAction("✓ Previous");
        addLog(`PREVIOUS [${source}] → Page ${next}`, "success");
      } else if (action === "TOGGLE") {
        const next = !isListeningRef.current;
        isListeningRef.current = next;
        setIsListening(next);
        setLastAction(next ? "Listening ON" : "Listening OFF");
        addLog(`System ${next ? "Resumed" : "Paused"} [${source}]`, "warning");
      }
    },
    [addLog]
  );

  // ── Keyboard fallback (→ NEXT, ← PREV, Space TOGGLE) ────────────────────
  // Registered globally on the document — does NOT fire if focus is in an input/textarea

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Never hijack typing in form fields
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleAction("NEXT", "keyboard");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleAction("PREVIOUS", "keyboard");
      } else if (e.key === " ") {
        e.preventDefault();
        handleAction("TOGGLE", "keyboard");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction]);

  // ── Gesture callbacks ─────────────────────────────────────────────────────

  const handleGestureStateChange = useCallback((newState: any) => {
    setGestureState(newState);
  }, []);

  const handleGestureAction = useCallback(
    (action: "NEXT" | "PREVIOUS" | "TOGGLE") => {
      handleAction(action, "gesture");
    },
    [handleAction]
  );

  // ── PDF upload ────────────────────────────────────────────────────────────

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || file.type !== "application/pdf") {
        addLog("Upload failed: PDF files only.", "warning");
        return;
      }
      // Revoke previous blob URL to avoid memory leaks
      if (pdfUrl !== SAMPLE_PDF_URL) URL.revokeObjectURL(pdfUrl);

      const blobUrl = URL.createObjectURL(file);
      setPdfUrl(blobUrl);
      setPdfTitle(file.name.replace(/\.pdf$/i, ""));
      // Reset to page 1 when a new file is loaded
      pageNumberRef.current = 1;
      numPagesRef.current = null;
      setPageNumber(1);
      setNumPages(null);
      addLog(`Loaded: "${file.name}"`, "info");

      // Reset file input so the same file can be re-uploaded
      e.target.value = "";
    },
    [pdfUrl, addLog]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen w-screen bg-black overflow-hidden flex relative">

      {/* ── Heads-Up Display (top-centre) ── */}
      <SystemHUD
        isListening={isListening}
        rawGesture={gestureState.rawGesture}
        stableGesture={gestureState.stableGesture}
        confidence={gestureState.confidenceLevel}
        toggleProgress={gestureState.toggleProgress}
        lastAction={lastAction}
      />

      {/* ── Keyboard shortcut hint (top-centre, below HUD) ── */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
          <Keyboard className="w-3 h-3 text-white/30" />
          <span className="text-[10px] font-mono text-white/30 tracking-wider">
            ← / → navigate &nbsp;·&nbsp; Space toggle listening
          </span>
        </div>
      </div>

      {/* ── Main content: PDF viewer ── */}
      <div className="flex-1 flex flex-col h-full relative z-10">
        <PDFViewer
          url={pdfUrl}
          pageNumber={pageNumber}
          onLoadSuccess={(num) => {
            numPagesRef.current = num;
            setNumPages(num);
            addLog(`PDF loaded: "${pdfTitle}" — ${num} page${num !== 1 ? "s" : ""}`, "info");
          }}
        />

        {/* Page counter pill */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-full border border-white/10 text-white font-mono text-sm shadow-xl backdrop-blur-md select-none">
          Page {pageNumber} / {numPages ?? "—"}
        </div>
      </div>

      {/* ── Event log sidebar ── */}
      <EventLog logs={logs} />

      {/* ── Bottom-left: webcam + controls ── */}
      <div className="absolute bottom-6 left-6 z-50 flex flex-col gap-2 w-[200px]">
        <GestureDetector
          isActive={isListening}
          onGestureStateChange={handleGestureStateChange}
          onAction={handleGestureAction}
        />

        {/* Pause / Resume gesture sensing */}
        <Button
          size="sm"
          variant="secondary"
          className="w-full text-xs font-mono bg-white/10 hover:bg-white/20 text-white border border-white/10"
          onClick={() => handleAction("TOGGLE", "keyboard")}
        >
          {isListening ? "PAUSE SENSORS" : "RESUME SENSORS"}
        </Button>

        {/* Upload own PDF */}
        <Button
          size="sm"
          variant="secondary"
          className="w-full text-xs font-mono bg-white/10 hover:bg-white/20 text-white border border-white/10 flex items-center justify-center gap-1.5"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-3 h-3" />
          UPLOAD PDF
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* ── Manual nav buttons (top-right, always-visible fallback) ── */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="text-white/60 hover:text-white hover:bg-white/10 font-mono text-xs border border-white/10"
          onClick={() => handleAction("PREVIOUS", "keyboard")}
          disabled={pageNumber <= 1}
        >
          ← Prev
        </Button>
        <span className="text-white/40 font-mono text-xs px-1 select-none">
          {pageNumber} / {numPages ?? "?"}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="text-white/60 hover:text-white hover:bg-white/10 font-mono text-xs border border-white/10"
          onClick={() => handleAction("NEXT", "keyboard")}
          disabled={!!numPages && pageNumber >= numPages}
        >
          Next →
        </Button>
      </div>

      {/* ── Back button ── */}
      <Link href="/" className="absolute top-6 left-6 z-50">
        <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10">
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}
