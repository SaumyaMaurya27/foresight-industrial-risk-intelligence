import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, ShieldCheck, Clock, CheckCircle2, Info, Thermometer, Wind, Gauge, Flame } from 'lucide-react';
import { RiskGauge } from './RiskGauge';
import { StatusBadge } from './StatusBadge';

export const ZoneCard = ({ zoneData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    zone,
    incident_type,
    risk_score,
    confidence_score,
    time_to_escalation,
    risk_factors,
    recommended_actions,
    temperature,
    gas_level,
    pressure,
    ventilation,
    maintenance_activity,
    hot_work_permit,
    confined_space_entry
  } = zoneData;

  // Determine status classification based on score
  let statusColor = 'bg-emerald-500';
  let pulseGlow = 'glow-safe';
  let cardBorder = 'hover:border-emerald-300';
  let severity = 'Safe';

  if (risk_score >= 85) {
    statusColor = 'bg-rose-500';
    pulseGlow = 'glow-critical animate-pulse';
    cardBorder = 'border-rose-200 hover:border-rose-400';
    severity = 'Critical';
  } else if (risk_score >= 70) {
    statusColor = 'bg-orange-500';
    pulseGlow = 'glow-high animate-pulse';
    cardBorder = 'border-orange-200 hover:border-orange-400';
    severity = 'High';
  } else if (risk_score >= 40) {
    statusColor = 'bg-amber-500';
    pulseGlow = 'glow-moderate';
    cardBorder = 'border-amber-200 hover:border-amber-400';
    severity = 'Moderate';
  } else {
    cardBorder = 'border-slate-200 hover:border-emerald-400';
  }

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.25, ease: 'easeInOut' } }}
      className={`bg-white border rounded-xl shadow-refinery hover:shadow-refineryHover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden ${cardBorder}`}
    >
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Block: Zone, Status Icon, Incident Type & Telemetry */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-4">
              {/* Animated Status Indicator */}
              <div className="relative flex h-3.5 w-3.5 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColor}`}></span>
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${statusColor} ${pulseGlow}`}></span>
              </div>
              
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-lg font-extrabold text-refinery-text-primary tracking-tight">
                    {zone}
                  </h4>
                  <StatusBadge value={severity} />
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {incident_type === 'Safe' ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-refinery-text-secondary">
                    Assessment: <span className="font-bold text-slate-800">{incident_type}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Telemetry Metrics Panel Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center space-x-2.5">
                <Thermometer className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">TEMP</span>
                  <span className="text-xs font-extrabold text-slate-800 block">{temperature ?? 0} °C</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center space-x-2.5">
                <Flame className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">GAS LEVEL</span>
                  <span className="text-xs font-extrabold text-slate-800 block">{gas_level ?? 0} % LEL</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center space-x-2.5">
                <Gauge className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">PRESSURE</span>
                  <span className="text-xs font-extrabold text-slate-800 block">{pressure ?? 0} %</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center space-x-2.5">
                <Wind className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">VENTILATION</span>
                  <span className="text-xs font-extrabold text-slate-800 block">{ventilation ?? 0} %</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block: Circular Gauge & Essential Stats */}
          <div className="flex items-center justify-between sm:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0">
            <div className="space-y-1.5 text-right sm:text-left">
              <div className="flex items-center gap-1.5 justify-end sm:justify-start">
                <span className="text-[11px] font-bold text-refinery-text-muted uppercase tracking-wider">
                  CONFIDENCE:
                </span>
                <span className="text-xs font-bold text-slate-800">{confidence_score}%</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end sm:justify-start text-xs font-semibold text-refinery-text-secondary">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Escalation: {time_to_escalation}</span>
              </div>
            </div>

            {/* Large Progress Gauge */}
            <div className="h-[95px] w-[95px] shrink-0">
              <RiskGauge score={risk_score} />
            </div>
          </div>

        </div>

        {/* Expand Details Trigger */}
        <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-refinery-text-muted font-semibold">
              {incident_type === 'Safe' 
                ? 'Zone operating normally' 
                : `${risk_factors.length} active risk factors identified`}
            </span>
            {(maintenance_activity || hot_work_permit || confined_space_entry) && (
              <span className="inline-flex gap-1">
                {maintenance_activity && <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-blue-50 text-blue-700 border border-blue-100">MAINT</span>}
                {hot_work_permit && <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-50 text-amber-700 border border-amber-100">HOT WORK</span>}
                {confined_space_entry && <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-purple-50 text-purple-700 border border-purple-100">CONFINED</span>}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors focus:outline-none"
          >
            <span>{isExpanded ? 'Hide Details' : 'Expand Details'}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Expandable Section */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-t border-slate-100 bg-slate-50/50"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Active Risk Factors */}
              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                  <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  Risk Factors
                </h5>
                {risk_factors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {risk_factors.map((factor, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1.5 text-orange-500 shrink-0" />
                        {factor}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-medium text-slate-400 italic block py-1.5">
                    No active risk factors present
                  </span>
                )}
              </div>

              {/* Recommended Actions */}
              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  Recommended Mitigation Directives
                </h5>
                <ul className="space-y-2">
                  {recommended_actions.length > 0 ? (
                    recommended_actions.map((action, index) => (
                      <li key={index} className="flex items-start text-xs text-refinery-text-secondary font-medium">
                        <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-50 text-blue-600 mr-2.5 mt-0.5 border border-blue-100 font-bold shrink-0">
                          {index + 1}
                        </span>
                        <span>{action}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs font-medium text-slate-400 italic">
                      No immediate mitigation required
                    </li>
                  )}
                </ul>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
