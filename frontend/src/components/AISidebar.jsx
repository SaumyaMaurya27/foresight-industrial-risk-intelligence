import React, { useState, useEffect } from 'react';
import {
  Brain,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ListChecks,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const AISidebar = ({ activeZone, zones = [], onSelectZone }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedTime, setGeneratedTime] = useState(null);

  // Auto reset or trigger when zone changes if appropriate
  const currentZone = activeZone || (zones.length > 0 ? zones[0] : null);

  const handleGenerateExplanation = async () => {
    if (!currentZone) return;

    setLoading(true);
    setError(null);

    const payload = {
      zone: currentZone.zone || "Zone A",
      temperature: currentZone.temperature ?? 0,
      pressure: currentZone.pressure ?? 0,
      gas_level: currentZone.gas_level ?? 0,
      ventilation: currentZone.ventilation ?? 0,
      maintenance_activity: currentZone.maintenance_activity ?? false,
      hot_work_permit: currentZone.hot_work_permit ?? false,
      confined_space_entry: currentZone.confined_space_entry ?? false,
      incident_type: currentZone.incident_type || "Safe",
      risk_score: currentZone.risk_score || 0,
      confidence_score: currentZone.confidence_score || currentZone.confidence || 75,
      time_to_escalation: currentZone.time_to_escalation || "Immediate",
      risk_factors: currentZone.risk_factors || [],
      recommended_actions: currentZone.recommended_actions || []
    };

    try {
      const response = await fetch('http://localhost:8000/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}`);
      }

      const data = await response.json();
      setReport(data);

      const now = new Date();
      setGeneratedTime(now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    } catch (err) {
      console.error('Failed to fetch AI explanation:', err);
      setError(err.message || 'Could not connect to Gemini API endpoint');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadgeClass = (priority) => {
    const p = String(priority || '').toUpperCase();
    if (p === 'CRITICAL') return 'bg-rose-500 text-white border-rose-600';
    if (p === 'HIGH') return 'bg-orange-500 text-white border-orange-600';
    if (p === 'MEDIUM') return 'bg-amber-500 text-white border-amber-600';
    return 'bg-emerald-500 text-white border-emerald-600';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-refinery flex flex-col justify-between space-y-6">

      {/* Header Info Block */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600 shrink-0" />
              <h4 className="text-sm font-extrabold text-slate-800 tracking-tight uppercase">
                AI Safety Analyst
              </h4>
            </div>
            {generatedTime && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Generated: {generatedTime}
              </p>
            )}
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Gemini 2.5 Flash
          </span>
        </div>

        {/* Zone Selector */}
        {zones.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Select Sector
            </label>
            <select
              value={currentZone?.zone || ''}
              onChange={(e) => {
                const z = zones.find((item) => item.zone === e.target.value);
                if (z && onSelectZone) onSelectZone(z);
                setReport(null);
                setGeneratedTime(null);
              }}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              {zones.map((z) => (
                <option key={z.zone} value={z.zone}>
                  {z.zone} — Risk: {z.risk_score} ({z.incident_type})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 my-1"></div>

      {/* Main Content Body */}
      <div className="flex-1 space-y-5 max-h-[540px] overflow-y-auto pr-1">
        {!report && !loading && !error && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-40 scale-150"></div>
              <div className="relative h-16 w-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <Sparkles className="h-8 w-8 stroke-[1.4] text-blue-500" />
              </div>
            </div>

            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              AI Analysis Ready
            </p>
            <p className="text-xs text-refinery-text-muted mt-1.5 max-w-[220px] font-medium leading-relaxed">
              Select a refinery zone and trigger Gemini AI to synthesize operational safety intelligence.
            </p>
          </div>
        )}

        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <Brain className="h-5 w-5 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider animate-pulse">
                Synthesizing Safety Report...
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                Invoking Gemini API with active sensor vectors
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center text-rose-700 font-bold space-x-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>AI Report Generation Failed</span>
            </div>
            <p className="text-rose-600 leading-relaxed text-[11px] font-medium">
              {error}
            </p>
          </div>
        )}

        {report && !loading && (
          <div className="space-y-5 animate-fadeIn">
            {/* Executive Summary */}
            <div className="space-y-1.5">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-blue-600" />
                Executive Summary
              </h5>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                {report.executive_summary}
              </p>
            </div>

            <div className="border-t border-slate-100"></div>

            {/* Priority Badge */}
            <div className="space-y-1.5">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Safety Priority Level
              </h5>
              <div className={`w-full text-center py-2.5 rounded text-xs font-black tracking-widest uppercase border ${getPriorityBadgeClass(report.priority)}`}>
                {report.priority} PRIORITY
              </div>
            </div>

            {/* Root Causes */}
            {report.root_causes && report.root_causes.length > 0 && (
              <>
                <div className="border-t border-slate-100"></div>
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    Root Causes
                  </h5>
                  <ul className="space-y-1.5 pl-1">
                    {report.root_causes.map((cause, idx) => (
                      <li key={idx} className="flex items-start text-xs text-slate-700 font-semibold leading-relaxed">
                        <ChevronRight className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5 mr-1" />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Possible Consequences */}
            {report.possible_consequences && report.possible_consequences.length > 0 && (
              <>
                <div className="border-t border-slate-100"></div>
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                    Possible Consequences
                  </h5>
                  <ul className="space-y-1.5 pl-1">
                    {report.possible_consequences.map((item, idx) => (
                      <li key={idx} className="flex items-start text-xs text-slate-700 font-semibold leading-relaxed">
                        <ChevronRight className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5 mr-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Immediate Actions */}
            {report.immediate_actions && report.immediate_actions.length > 0 && (
              <>
                <div className="border-t border-slate-100"></div>
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Immediate Directives
                  </h5>
                  <ul className="space-y-2 pl-1">
                    {report.immediate_actions.map((act, idx) => (
                      <li key={idx} className="flex items-start text-xs text-slate-700 font-semibold leading-relaxed">
                        <span className="h-4 w-4 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-[9px] mr-2 mt-0.5 shrink-0">
                          {idx + 1}
                        </span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Long Term Prevention / Recommendations */}
            {report.long_term_prevention && report.long_term_prevention.length > 0 && (
              <>
                <div className="border-t border-slate-100"></div>
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ListChecks className="h-3.5 w-3.5 text-blue-600" />
                    Long-Term Recommendations
                  </h5>
                  <ul className="space-y-1.5 pl-1">
                    {report.long_term_prevention.map((prev, idx) => (
                      <li key={idx} className="flex items-start text-xs text-slate-700 font-semibold leading-relaxed">
                        <ChevronRight className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5 mr-1" />
                        <span>{prev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 my-1"></div>

      {/* Control Action Panel */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleGenerateExplanation}
          disabled={loading || !currentZone}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          <span>{report ? "Refresh AI Assessment" : "Generate AI Assessment"}</span>
        </button>
      </div>

    </div>
  );
};
