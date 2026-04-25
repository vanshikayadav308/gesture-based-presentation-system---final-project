import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning';
}

interface EventLogProps {
  logs: LogEntry[];
}

export function EventLog({ logs }: EventLogProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div 
      animate={{ width: isCollapsed ? "60px" : "320px" }}
      className="bg-black/80 backdrop-blur-md border-r border-white/10 h-full flex flex-col shadow-2xl transition-all duration-300 ease-in-out relative"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-md">
              <Terminal className="w-4 h-4 text-white/70" />
            </div>
            <span className="font-mono text-sm font-bold text-white/90 tracking-tight">EVENT LOG</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto text-white/50 hover:text-white hover:bg-white/10"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 rotate-90" />}
        </Button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="group relative pl-4 border-l-2 border-white/10 hover:border-white/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3 text-white/30" />
                    <span className="text-[10px] font-mono text-white/40">
                      {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs font-mono leading-relaxed ${
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    'text-white/70'
                  }`}>
                    {log.message}
                  </p>
                </motion.div>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-10">
                  <span className="text-xs font-mono text-white/20">Waiting for events...</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}

      {/* Footer / Status */}
      {!isCollapsed && (
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
            <span>STATUS: MONITORING</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              ONLINE
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
