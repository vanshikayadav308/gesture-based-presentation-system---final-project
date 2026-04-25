import { Document, Page, pdfjs } from "react-pdf";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker source to CDN for standard react-pdf functionality without custom webpack config
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
  pageNumber: number;
  onLoadSuccess: (numPages: number) => void;
}

export function PDFViewer({ url, pageNumber, onLoadSuccess }: PDFViewerProps) {
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // Resize observer to make PDF responsive
  useEffect(() => {
    const el = document.getElementById("pdf-container");
    if (el) {
      // Set initial width immediately
      setContainerWidth(el.clientWidth || 800);
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentBoxSize) {
            setContainerWidth(entry.contentBoxSize[0].inlineSize);
          } else {
            setContainerWidth(entry.contentRect.width);
          }
        }
      });
      resizeObserver.observe(el);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div id="pdf-container" className="flex-1 bg-neutral-900/50 flex items-center justify-center p-8 overflow-hidden h-full">
      <div className="shadow-2xl rounded-lg overflow-hidden border border-white/5 bg-white">
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => onLoadSuccess(numPages)}
          loading={
            <div className="flex flex-col items-center justify-center h-96 w-full text-white/50">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p className="font-mono text-sm">Loading PDF Document...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-96 w-full text-red-400">
              <AlertCircle className="w-8 h-8 mb-4" />
              <p className="font-mono text-sm">Failed to load PDF</p>
            </div>
          }
        >
          {containerWidth > 0 && (
            <Page
              pageNumber={pageNumber}
              width={Math.min(containerWidth - 64, 1200)}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              className="transition-opacity duration-300"
            />
          )}
        </Document>
      </div>
    </div>
  );
}
