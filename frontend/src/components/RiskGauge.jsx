import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

export const RiskGauge = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Determine color matching refinery standards
  let strokeColor = '#10b981'; // safe
  let shadowClass = 'glow-safe';
  
  if (score >= 85) {
    strokeColor = '#ef4444'; // critical
    shadowClass = 'glow-critical';
  } else if (score >= 70) {
    strokeColor = '#f97316'; // high
    shadowClass = 'glow-high';
  } else if (score >= 40) {
    strokeColor = '#eab308'; // moderate
    shadowClass = 'glow-moderate';
  }

  // Animate the text number count up
  useEffect(() => {
    let start = 0;
    const end = Math.round(score);
    if (start === end) {
      setAnimatedScore(end);
      return;
    }
    const duration = 0.8;
    const increment = (end - start) / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setAnimatedScore(end);
      } else {
        setAnimatedScore(Math.round(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [score]);

  // SVG Circular Constants
  const size = 110;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center select-none">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      {/* Absolute text in the center */}
      <div className="absolute text-center">
        <span className="text-2xl font-black text-slate-800 tracking-tight block">
          {animatedScore}
        </span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block -mt-1">
          RISK UNIT
        </span>
      </div>
    </div>
  );
};
