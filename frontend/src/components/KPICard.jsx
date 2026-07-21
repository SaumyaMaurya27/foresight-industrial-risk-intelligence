import React from 'react';
import { motion } from 'framer-motion';

export const KPICard = ({ title, value, subtitle, icon: Icon, colorClass }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-refinery-border rounded-xl p-5 shadow-refinery hover:shadow-refineryHover transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold text-refinery-text-muted uppercase tracking-wider block mb-1">
            {title}
          </span>
          <h3 className={`text-2xl font-black tracking-tight ${colorClass || 'text-slate-800'}`}>
            {value}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-refinery-text-secondary mt-1.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="bg-slate-50 text-slate-600 p-2.5 rounded-lg border border-slate-100/50">
            <Icon className="h-5 w-5 stroke-[1.8]" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
