import React from 'react';

export const LoadingSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-pulse">
      
      {/* 1. Header / KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 h-28 flex flex-col justify-between">
            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
            <div className="h-6 bg-slate-200 rounded w-1/2 mt-2"></div>
            <div className="h-3 bg-slate-200 rounded w-2/3 mt-2"></div>
          </div>
        ))}
      </div>

      {/* 2. Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Zone Cards + Trend Chart */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
          
          {/* Zone Cards */}
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-xl p-6 h-36 flex items-center justify-between">
              <div className="space-y-3 w-1/2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
              <div className="h-20 w-20 bg-slate-200 rounded-full shrink-0"></div>
            </div>
          ))}

          {/* Chart placeholder */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 h-[320px] flex flex-col justify-between">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="flex-1 bg-slate-100 rounded-lg mt-4 w-full"></div>
          </div>
        </div>

        {/* Right Panel: Sidebars */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-xl p-6 h-[480px] flex flex-col justify-between">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-32 bg-slate-100 rounded-lg w-full"></div>
            <div className="h-10 bg-slate-200 rounded-lg w-full"></div>
          </div>
        </div>

      </div>

    </div>
  );
};
