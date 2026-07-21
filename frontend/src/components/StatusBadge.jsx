import React from 'react';

export const StatusBadge = ({ value }) => {
  const normalizedValue = String(value).trim().toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = value;

  if (normalizedValue === 'safe' || normalizedValue === 'low') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
    label = 'Safe';
  } else if (normalizedValue === 'moderate' || normalizedValue === 'medium') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/60';
    label = 'Medium';
  } else if (normalizedValue === 'high') {
    styles = 'bg-orange-50 text-orange-700 border-orange-200/60';
    label = 'High Risk';
  } else if (normalizedValue === 'critical') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/60';
    label = 'Critical Alert';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
        normalizedValue === 'safe' || normalizedValue === 'low' ? 'bg-emerald-500' :
        normalizedValue === 'moderate' || normalizedValue === 'medium' ? 'bg-amber-500' :
        normalizedValue === 'high' ? 'bg-orange-500' : 'bg-rose-500'
      }`}></span>
      {label}
    </span>
  );
};
