import React from 'react';
import { motion } from 'framer-motion';

export const KPICard = ({ title, value, subtitle, icon: Icon, colorClass }) => {
  // Determine subtle colored top border based on the colorClass styling
  let topBorderColor = 'border-t-4 border-t-slate-300';
  if (colorClass) {
    if (colorClass.includes('rose-600') || colorClass.includes('rose-500')) {
      topBorderColor = 'border-t-4 border-t-rose-500';
    } else if (colorClass.includes('orange-500')) {
      topBorderColor = 'border-t-4 border-t-orange-500';
    } else if (colorClass.includes('amber-500')) {
      topBorderColor = 'border-t-4 border-t-amber-500';
    } else if (colorClass.includes('emerald-500')) {
      topBorderColor = 'border-t-4 border-t-emerald-500';
    }
  } else if (title.toLowerCase().includes('average')) {
    topBorderColor = 'border-t-4 border-t-blue-500';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white border-x border-b border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${topBorderColor}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
            {title}
          </span>
          <h3 className={`text-3xl font-black tracking-tight ${colorClass || 'text-slate-800'}`}>
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium leading-normal pt-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="bg-slate-50 text-slate-500 p-2.5 rounded-lg border border-slate-100 shrink-0">
            <Icon className="h-5 w-5 stroke-[2.0]" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
