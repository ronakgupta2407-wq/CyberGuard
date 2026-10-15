import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export default function RiskBadge({ level = 'Low', size = 'md', showIcon = true }) {
  const norm = String(level).toLowerCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = HelpCircle;

  if (norm === 'critical' || norm === 'failed' || norm === 'conflicting') {
    colorClasses = 'bg-rose-950/80 text-rose-400 border-rose-800/80 shadow-sm shadow-rose-950';
    Icon = ShieldAlert;
  } else if (norm === 'high') {
    colorClasses = 'bg-orange-950/80 text-orange-400 border-orange-800/80 shadow-sm shadow-orange-950';
    Icon = AlertTriangle;
  } else if (norm === 'medium' || norm === 'warning' || norm === 'potentially missing' || norm === 'missing') {
    colorClasses = 'bg-amber-950/80 text-amber-400 border-amber-800/80 shadow-sm shadow-amber-950';
    Icon = AlertCircle;
  } else if (norm === 'low' || norm === 'informational') {
    colorClasses = 'bg-sky-950/80 text-sky-400 border-sky-800/80';
    Icon = ShieldCheck;
  } else if (norm === 'safe' || norm === 'passed' || norm === 'supported') {
    colorClasses = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80 shadow-sm shadow-emerald-950';
    Icon = CheckCircle2;
  } else if (norm === 'inconclusive' || norm === 'could_not_complete') {
    colorClasses = 'bg-slate-800/80 text-slate-400 border-slate-700';
    Icon = HelpCircle;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${colorClasses} tracking-wide transition-all`}>
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{level}</span>
    </span>
  );
}
