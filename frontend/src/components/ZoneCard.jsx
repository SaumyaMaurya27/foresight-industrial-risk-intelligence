import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, ShieldCheck, Clock, CheckCircle2, Info } from 'lucide-react';
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
      className={`bg-white border rounded-xl shadow-refinery hover:shadow-refineryHover transition-shadow duration-300 overflow-hidden ${cardBorder}`}
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Left Block: Zone, Status Icon, and Incident Type */}
          <div className="flex items-center space-x-4">
            {/* Animated Status Indicator */}
            <div className="relative flex h-3.5 w-3.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColor}`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${statusColor} ${pulseGlow}`}></span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-extrabold text-refinery-text-primary tracking-tight">
                  {zone}
                </h4>
                <StatusBadge value={severity} />
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {incident_type === 'Safe' ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-xs font-semibold text-refinery-text-secondary">
                  Assessment: <span className="font-bold text-slate-800">{incident_type}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Block: Circular Gauge & Essential Stats */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
            {/* Additional details displayed in compressed form */}
            <div className="space-y-1.5 text-right sm:text-left">
              <div className="flex items-center gap-1.5 justify-end sm:justify-start">
                <span className="text-[11px] font-bold text-refinery-text-muted uppercase tracking-wider">
                  CONFIDENCE:
                </span>
                <span className="text-xs font-bold text-slate-800">{confidence_score}%</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end sm:justify-start text-xs font-semibold text-refinery-text-secondary">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Escalation: {time_to_escalation}</span>
              </div>
            </div>

            {/* Large Progress Gauge */}
            <div className="h-[110px] w-[110px]">
              <RiskGauge score={risk_score} />
            </div>
          </div>

        </div>

        {/* Expand Details Trigger */}
        <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between items-center">
          <span className="text-xs text-refinery-text-muted font-medium">
            {incident_type === 'Safe' 
              ? 'Zone operating normally' 
              : `${risk_factors.length} active risk factors identified`}
          </span>
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
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                  Risk Factors
                </h5>
                {risk_factors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {risk_factors.map((factor, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1.5 text-orange-500" />
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
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
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
