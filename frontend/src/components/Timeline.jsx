import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

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
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-refinery">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          <h4 className="text-sm font-extrabold text-slate-800 tracking-tight uppercase">
            Incident Prediction Log
          </h4>
          <p className="text-xs text-refinery-text-muted mt-0.5 font-medium">
            Streaming real-time telemetry warning signals and hazard trigger points.
          </p>
        </div>
        <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
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
              let severityBadgeClass = 'bg-amber-50 border-amber-200 text-amber-700';

              if (event.severity === 'Critical') {
                iconColor = 'text-rose-500 bg-rose-50 border-rose-200';
                scoreColor = 'text-rose-700';
                bulletColor = 'border-rose-400 bg-rose-500';
                severityBadgeClass = 'bg-rose-50 border-rose-200 text-rose-700';
              } else if (event.severity === 'High') {
                iconColor = 'text-orange-500 bg-orange-50 border-orange-200';
                scoreColor = 'text-orange-700';
                bulletColor = 'border-orange-400 bg-orange-500';
                severityBadgeClass = 'bg-orange-50 border-orange-200 text-orange-700';
              }

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="relative flex items-start gap-4 hover:bg-slate-50/50 p-3 rounded-lg border border-transparent hover:border-slate-100 transition-colors select-none"
                >
                  {/* Custom Bullet Node */}
                  <div className={`absolute -left-[20px] top-[18px] h-2.5 w-2.5 rounded-full border-2 ${bulletColor} z-10`}></div>

                  {/* Icon Panel */}
                  <div className={`p-2 rounded-lg border shrink-0 ${iconColor}`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>

                  {/* Metadata & Description */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-slate-800">
                          {event.zone} &bull; <span className="font-extrabold text-blue-600">{event.incident}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${severityBadgeClass}`}>
                          {event.severity}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatEventTime(event.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${scoreColor}`}>
                        Risk Score: {event.riskScore}
                      </span>
                      {event.factors && event.factors.length > 0 && (
                        <span className="text-[10.5px] text-slate-400 font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
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
