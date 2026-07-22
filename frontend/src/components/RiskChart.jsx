import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Custom tooltip styled for high-contrast industrial screens
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-3.5 shadow-xl font-mono text-xs space-y-2">
        <p className="font-bold border-b border-slate-800 pb-1.5 font-sans text-slate-300">Time: {label}</p>
        <div className="space-y-1.5">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-400 font-sans font-medium">{entry.name}:</span>
              </span>
              <span className="font-extrabold text-right" style={{ color: entry.color }}>
                {entry.value.toFixed(1)} % Risk
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
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-refinery">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
        <div>
          <h4 className="text-sm font-extrabold text-slate-800 tracking-tight uppercase">
            Zone Risk Trend Analysis
          </h4>
          <p className="text-xs text-refinery-text-muted mt-0.5 font-medium">
            Real-time compound threat timeline comparison for monitoring stability.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="tracking-wider uppercase">ZONE A</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="tracking-wider uppercase">ZONE B</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="tracking-wider uppercase">ZONE C</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorZoneA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorZoneB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorZoneC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12}/>
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
                dy={8}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                fontWeight={600}
                tickLine={false} 
                axisLine={false} 
                domain={[0, 100]}
                dx={-8}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="Zone A"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorZoneA)"
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive={true}
              />
              <Area
                type="monotone"
                dataKey="Zone B"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorZoneB)"
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive={true}
              />
              <Area
                type="monotone"
                dataKey="Zone C"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorZoneC)"
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-xs font-semibold text-slate-400 select-none">
            Awaiting streaming trend telemetry...
          </div>
        )}
      </div>
    </div>
  );
};
