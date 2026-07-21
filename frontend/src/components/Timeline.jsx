import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Timeline = ({ events }) => {
  const formatEventTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="bg-white border border-refinery-border rounded-xl p-6 shadow-refinery">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase">
            Incident Prediction Log
          </h4>
          <p className="text-xs text-refinery-text-muted mt-0.5">
            Streaming real-time telemetry warning signals and hazard trigger points.
          </p>
        </div>
        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {events.length} LOGS
        </span>
      </div>

      <div className="relative pl-6 max-h-[420px] overflow-y-auto pr-2 space-y-4">
        {/* Continuous Timeline Line */}
        {events.length > 0 && (
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
        )}

        <AnimatePresence initial={false}>
          {events.length > 0 ? (
            events.map((event) => {
              let iconColor = 'text-amber-500 bg-amber-50 border-amber-200';
              let scoreColor = 'text-amber-700';
              let bulletColor = 'border-amber-400 bg-amber-500';

              if (event.severity === 'Critical') {
                iconColor = 'text-rose-500 bg-rose-50 border-rose-200';
                scoreColor = 'text-rose-700';
                bulletColor = 'border-rose-400 bg-rose-500';
              } else if (event.severity === 'High') {
                iconColor = 'text-orange-500 bg-orange-50 border-orange-200';
                scoreColor = 'text-orange-700';
                bulletColor = 'border-orange-400 bg-orange-500';
              }

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="relative flex items-start gap-4 hover:bg-slate-50/50 p-2.5 rounded-lg border border-transparent hover:border-slate-100 transition-colors select-none"
                >
                  {/* Custom Bullet Node */}
                  <div className={`absolute -left-[20px] top-[14px] h-2.5 w-2.5 rounded-full border-2 ${bulletColor} z-10`}></div>

                  {/* Icon Panel */}
                  <div className={`p-2 rounded-lg border shrink-0 ${iconColor}`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>

                  {/* Metadata & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-800">
                        {event.zone} &bull; <span className="font-extrabold text-blue-600">{event.incident}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {formatEventTime(event.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[11px] font-bold ${scoreColor}`}>
                        Risk Score: {event.riskScore}
                      </span>
                      {event.factors && event.factors.length > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                          ({event.factors.join(', ')})
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="p-3 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-600 mb-3">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Normal Operational Logs
              </h5>
              <p className="text-[11px] text-slate-400 max-w-[240px] mt-1 leading-relaxed">
                Refinery zones are operating safely. No incident predictions or warning thresholds triggered.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
