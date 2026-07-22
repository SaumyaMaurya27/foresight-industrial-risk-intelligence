import React, { useState, useEffect } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { Navbar } from '../components/Navbar';
import { KPICard } from '../components/KPICard';
import { ZoneCard } from '../components/ZoneCard';
import { RiskChart } from '../components/RiskChart';
import { Timeline } from '../components/Timeline';
import { AISidebar } from '../components/AISidebar';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  ShieldAlert,
  Activity,
  Flame,
  ServerCrash,
  RefreshCw,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export const Dashboard = () => {
  const { data, loading, error, isConnected, timeline, handleRetry } = useDashboard(4000);
  const [chartHistory, setChartHistory] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);


  // Accumulate trend history for Recharts
  useEffect(() => {
    if (data?.zones) {
      const timestampStr = data.last_updated
        ? new Date(data.last_updated).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
        : new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

      const snapshot = {
        time: timestampStr,
        'Zone A': 0,
        'Zone B': 0,
        'Zone C': 0
      };

      data.zones.forEach((z) => {
        if (z.zone === 'Zone A' || z.zone === 'Zone B' || z.zone === 'Zone C') {
          snapshot[z.zone] = z.risk_score;
        }
      });

      setChartHistory((prev) => {
        const updated = [...prev, snapshot];
        // Retain last 12 historical points for stability
        if (updated.length > 12) {
          return updated.slice(updated.length - 25);
        }
        return updated;
      });
    }
  }, [data]);

  // Determine Overall Risk level styles
  const getOverallRiskStyles = (risk) => {
    const r = String(risk).trim().toLowerCase();
    if (r === 'critical') return 'text-rose-600';
    if (r === 'high') return 'text-orange-500';
    if (r === 'medium' || r === 'moderate') return 'text-amber-500';
    return 'text-emerald-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-refinery-bg">
        <Navbar isConnected={isConnected} />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-refinery-bg flex flex-col">
        <Navbar isConnected={false} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-8 shadow-refineryCard text-center space-y-6">
            <div className="inline-flex p-4 bg-rose-50 border border-rose-100 rounded-full text-rose-600">
              <ServerCrash className="h-10 w-10 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">
                Telemetry Link Interrupted
              </h3>
              <p className="text-xs text-refinery-text-secondary mt-2 leading-relaxed">
                Could not connect to the Foresight API server. Verify that the Python backend is running locally on <code className="bg-slate-50 border border-slate-100 px-1 py-0.5 rounded text-rose-600 font-bold font-mono">http://localhost:8000</code>.
              </p>
              <div className="bg-rose-50/50 border border-rose-100/50 rounded-lg p-3 mt-4 text-[10px] text-rose-800 font-mono text-left max-h-24 overflow-y-auto">
                System error: {error}
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Signal Link</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback defaults in case data hasn't loaded properly
  const metrics = data || {
    overall_risk: 'Low',
    overall_score: 0.0,
    average_risk: 0.0,
    critical_zone: 'None',
    high_risk_zones: 0,
    zones: []
  };

  return (
    <div className="min-h-screen bg-refinery-bg pb-12">

      {/* Navigation Header */}
      <Navbar isConnected={isConnected} />

      {/* Main Container */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Four KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Overall Risk Status"
            value={metrics.overall_risk}
            subtitle={`Highest compound risk score: ${metrics.overall_score}`}
            icon={ShieldAlert}
            colorClass={getOverallRiskStyles(metrics.overall_risk)}
          />
          <KPICard
            title="Average Risk Index"
            value={`${metrics.average_risk} ERS`}
            subtitle="Mean environmental & operational load"
            icon={Activity}
          />
          <KPICard
            title="Critical Zone"
            value={metrics.critical_zone || 'None'}
            subtitle={
              metrics.critical_zone
                ? 'Highest active operational risks'
                : 'All sectors working within limits'
            }
            icon={Flame}
            colorClass={metrics.critical_zone ? 'text-rose-600' : 'text-slate-800'}
          />
          <KPICard
            title="High Risk Zones"
            value={metrics.high_risk_zones}
            subtitle={`Out of ${metrics.zone_count || metrics.zones.length} monitored sectors`}
            icon={AlertTriangle}
            colorClass={metrics.high_risk_zones > 0 ? 'text-orange-500 font-black' : 'text-slate-800'}
          />
        </div>

        {/* Operational Summary & AI Insights */}
        {metrics.summary && (
          <div className="bg-white border border-refinery-border rounded-xl p-6 shadow-refinery flex items-start space-x-4 relative overflow-hidden hover:shadow-refineryHover transition-all duration-300">
            <div className="absolute top-0 left-0 h-full w-1.5 bg-blue-600"></div>
            <div className="bg-blue-50 text-blue-600 p-3 rounded-lg border border-blue-100 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Operational Risk Summary & AI Insights
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                {metrics.summary}
              </p>
            </div>
          </div>
        )}

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Panel: Zone Telemetries, Charts, and Timelines (Col Span 8) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Zone Telemetry Cards Panel */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-bold text-slate-800 tracking-tight uppercase">
                    Refinery Sector Surveillance
                  </h3>
                  <p className="text-xs text-refinery-text-muted mt-0.5">
                    Real-time safety evaluations and escalation windows for each refinery zone.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                {metrics.zones && metrics.zones.length > 0 ? (
                  metrics.zones.map((zoneData) => (
                    <ZoneCard key={zoneData.zone} zoneData={zoneData} />
                  ))
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <h3 className="text-lg font-semibold text-slate-700">
                      No telemetry data available
                    </h3>
                    <p className="text-sm text-slate-500 mt-2">
                      Waiting for refinery sensor data...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Trend Chart */}
            <RiskChart data={chartHistory} />

            {/* Incident Log Timeline */}
            <Timeline events={timeline} />

          </div>

          {/* Right Panel: AI Analyst (Col Span 4) */}
          <div className="lg:col-span-4 lg:sticky lg:top-6">
            <AISidebar
              activeZone={
                selectedZone ||
                (metrics.zones && metrics.zones.length > 0
                  ? metrics.zones.reduce((max, z) => (z.risk_score > max.risk_score ? z : max), metrics.zones[0])
                  : null)
              }
              zones={metrics.zones || []}
              onSelectZone={(z) => setSelectedZone(z)}
            />
          </div>

        </div>

      </div>
    </div>
  );
};
