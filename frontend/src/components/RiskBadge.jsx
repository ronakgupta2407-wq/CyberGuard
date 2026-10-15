import React from 'react';

export default function RiskBadge({ level = 'Low', size = 'md' }) {
  const norm = String(level).toLowerCase();

  let badgeStyle = 'bg-neutral-800/80 text-neutral-300 border-neutral-700/80';
  let dotColor = 'bg-neutral-400';

  if (norm === 'critical' || norm === 'failed' || norm === 'conflicting') {
    badgeStyle = 'bg-red-500/10 text-red-400 border-red-500/20';
    dotColor = 'bg-red-500';
  } else if (norm === 'high') {
    badgeStyle = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    dotColor = 'bg-orange-500';
  } else if (norm === 'medium' || norm === 'warning' || norm === 'potentially missing' || norm === 'missing') {
    badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    dotColor = 'bg-amber-500';
  } else if (norm === 'low' || norm === 'informational') {
    badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    dotColor = 'bg-blue-500';
  } else if (norm === 'safe' || norm === 'passed' || norm === 'supported') {
    badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    dotColor = 'bg-emerald-500';
  } else if (norm === 'inconclusive' || norm === 'could_not_complete') {
    badgeStyle = 'bg-neutral-800/70 text-neutral-400 border-neutral-700/60';
    dotColor = 'bg-neutral-500';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2 font-medium',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${sizeClasses} ${badgeStyle} shrink-0`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{level}</span>
    </span>
  );
}
