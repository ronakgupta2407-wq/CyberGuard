import React from 'react';

export default function RiskBadge({ level = 'Low', size = 'md' }) {
  const norm = String(level).toLowerCase();

  let badgeStyle = 'bg-slate-900/80 text-slate-300 border-slate-700/80';
  let dotColor = 'bg-slate-400';
  let isAlert = false;

  if (norm === 'critical' || norm === 'failed' || norm === 'conflicting') {
    badgeStyle = 'bg-red-950/60 text-red-400 border-red-500/40 shadow-sm shadow-red-950';
    dotColor = 'bg-red-500 shadow-sm shadow-red-500';
    isAlert = true;
  } else if (norm === 'high') {
    badgeStyle = 'bg-orange-950/60 text-orange-400 border-orange-500/40 shadow-sm shadow-orange-950';
    dotColor = 'bg-orange-500';
    isAlert = true;
  } else if (norm === 'medium' || norm === 'warning' || norm === 'potentially missing' || norm === 'missing') {
    badgeStyle = 'bg-amber-950/60 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-950';
    dotColor = 'bg-amber-500';
  } else if (norm === 'low' || norm === 'informational') {
    badgeStyle = 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40 shadow-sm shadow-cyan-950';
    dotColor = 'bg-cyan-400';
  } else if (norm === 'safe' || norm === 'passed' || norm === 'supported') {
    badgeStyle = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-950';
    dotColor = 'bg-emerald-400 shadow-sm shadow-emerald-400';
  } else if (norm === 'inconclusive' || norm === 'could_not_complete') {
    badgeStyle = 'bg-slate-900/80 text-slate-400 border-slate-700/80';
    dotColor = 'bg-slate-500';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5 font-mono',
    md: 'text-[11px] px-2.5 py-1 gap-1.5 font-mono',
    lg: 'text-xs px-3 py-1.5 gap-2 font-mono font-semibold',
  }[size] || 'text-[11px] px-2.5 py-1 gap-1.5 font-mono';

  return (
    <span className={`inline-flex items-center rounded border tracking-wider uppercase font-medium ${sizeClasses} ${badgeStyle} shrink-0`}>
      <span className="relative flex h-1.5 w-1.5">
        {isAlert && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
      </span>
      <span>{level}</span>
    </span>
  );
}
