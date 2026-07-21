import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Custom tooltip styled like an industrial gauge indicator
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-3 shadow-xl font-mono text-xs">
        <p className="font-bold border-b border-slate-800 pb-1.5 mb-1.5 font-sans">Time: {label}</p>
        <div className="space-y-1">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-400 font-sans">{entry.name}:</span>
              </span>
              <span className="font-black text-right" style={{ color: entry.color }}>
                {entry.value.toFixed(1)} ERS
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const RiskChart = ({ data }) => {
  return (
    <div className="bg-white border border-refinery-border rounded-xl p-6 shadow-refinery">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase">
            Zone Risk Trend Analysis
          </h4>
          <p className="text-xs text-refinery-text-muted mt-0.5">
            Real-time compound threat timeline comparison for monitoring stability.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-refinery-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>ZONE A</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>ZONE B</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>ZONE C</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorZoneA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorZoneB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorZoneC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                fontSize={10} 
                fontWeight={600}
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                fontWeight={600}
                tickLine={false} 
                axisLine={false} 
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="Zone A"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorZoneA)"
                activeDot={{ r: 4 }}
                isAnimationActive={true}
              />
              <Area
                type="monotone"
                dataKey="Zone B"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorZoneB)"
                activeDot={{ r: 4 }}
                isAnimationActive={true}
              />
              <Area
                type="monotone"
                dataKey="Zone C"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorZoneC)"
                activeDot={{ r: 4 }}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-lg text-xs font-semibold text-slate-400 select-none">
            Awaiting streaming trend telemetry...
          </div>
        )}
      </div>
    </div>
  );
};
