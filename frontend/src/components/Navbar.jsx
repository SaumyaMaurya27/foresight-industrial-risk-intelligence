import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity } from 'lucide-react';

export const Navbar = ({ isConnected }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-refinery-border shadow-refinery px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 text-white p-2.5 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-refinery-text-primary">FORESIGHT</span>
              <span className="bg-blue-50 text-blue-700 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-blue-100">
                Control Room
              </span>
            </div>
            <p className="text-xs text-refinery-text-secondary font-medium tracking-wide">
              See Risk Before It Becomes Reality
            </p>
          </div>
        </div>

        {/* Live System Info & Control Room Clock */}
        <div className="flex items-center space-x-6 self-end md:self-auto">
          {/* Connection Status */}
          <div className="flex items-center space-x-2 border-r border-refinery-border pr-6">
            <span className="text-[11px] text-refinery-text-muted font-semibold uppercase tracking-wider">
              Telemetry Status:
            </span>
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
              isConnected 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                : 'bg-rose-50 text-rose-800 border border-rose-100'
            }`}>
              <Radio className={`h-3.5 w-3.5 ${isConnected ? 'animate-pulse text-emerald-600' : 'text-rose-600'}`} />
              <span>{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
          </div>

          {/* Master Clock */}
          <div className="flex items-center space-x-3 font-mono">
            <div className="bg-slate-50 border border-slate-100 rounded px-2.5 py-1 text-right">
              <span className="text-[10px] text-refinery-text-muted block leading-none font-sans font-bold uppercase tracking-wider mb-0.5">
                SYSTEM TIME
              </span>
              <span className="text-sm font-bold text-slate-800 tabular-nums">
                {formatTime(currentTime)}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded px-2.5 py-1 text-right hidden sm:block">
              <span className="text-[10px] text-refinery-text-muted block leading-none font-sans font-bold uppercase tracking-wider mb-0.5">
                SYSTEM DATE
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {formatDate(currentTime)}
              </span>
            </div>
          </div>
          
        </div>

      </div>
    </nav>
  );
};
