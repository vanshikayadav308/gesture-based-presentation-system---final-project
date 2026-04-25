import { motion, AnimatePresence } from "framer-motion";
import { Activity, Radio, Wifi, Hand, Lock } from "lucide-react";
import { useEffect, useState } from "react";

interface SystemHUDProps {
  isListening: boolean;
  rawGesture: string;
  stableGesture: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  toggleProgress: number; // 0-1
  lastAction: string | null;
}

export function SystemHUD({ isListening, rawGesture, stableGesture, confidence, toggleProgress, lastAction }: SystemHUDProps) {
  const [showToast, setShowToast] = useState(false);

  // Flash toast on new action
  useEffect(() => {
    if (lastAction) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 1200); // 1.2s auto-hide
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  // Determine confidence color
  const getConfidenceColor = (conf: string) => {
    if (conf === "HIGH") return "text-green-500";
    if (conf === "MEDIUM") return "text-yellow-500";
    return "text-red-500";
  };

  const getConfidenceValue = (conf: string) => {
    if (conf === "HIGH") return 0.95;
    if (conf === "MEDIUM") return 0.6;
    return 0.3;
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50 pointer-events-none">
      {/* Main Status Bar */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl relative overflow-hidden"
      >
        {/* Toggle Progress Background */}
        {toggleProgress > 0 && (
          <motion.div 
            className="absolute inset-0 bg-blue-500/20 z-0"
            initial={{ width: 0 }}
            animate={{ width: `${toggleProgress * 100}%` }}
          />
        )}

        {/* Status Indicator */}
        <div className="flex items-center gap-2 border-r border-white/10 pr-6 relative z-10">
          <div className={`p-1.5 rounded-full ${isListening ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <Wifi className={`w-4 h-4 ${isListening ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <span className="text-xs font-mono font-bold text-white/60 uppercase tracking-widest">
            {isListening ? "LISTENING ON" : "LISTENING OFF"}
          </span>
        </div>

        {/* Gestures */}
        <div className="flex items-center gap-6 relative z-10">
           {/* Raw */}
           <div className="flex flex-col w-24">
             <span className="text-[9px] font-mono text-white/30 uppercase">Raw</span>
             <span className="text-xs font-mono text-white/60 truncate">{rawGesture}</span>
           </div>
           
           {/* Stable */}
           <div className="flex flex-col w-28 border-l border-white/10 pl-6">
             <span className="text-[9px] font-mono text-white/30 uppercase">Stable</span>
             <span className={`text-sm font-bold font-mono tracking-wide ${stableGesture !== "NEUTRAL" ? 'text-white' : 'text-white/40'}`}>
               {stableGesture}
             </span>
             {toggleProgress > 0 && (
                <span className="text-[9px] text-blue-400 font-mono">
                  Hold to toggle: {Math.round(toggleProgress * 100)}%
                </span>
             )}
           </div>
        </div>

        {/* Confidence Meter */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-6 w-28 relative z-10">
          <Activity className="w-4 h-4 text-white/40" />
          <div className="flex flex-col w-full">
            <span className="text-[9px] font-mono text-white/40 uppercase">Confidence</span>
            <span className={`text-xs font-mono font-bold ${getConfidenceColor(confidence)}`}>
              {confidence}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Action Toast Notification */}
      <AnimatePresence>
        {showToast && lastAction && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 backdrop-blur-sm"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            {lastAction}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
