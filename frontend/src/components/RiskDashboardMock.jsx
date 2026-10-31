import { motion, useReducedMotion } from 'framer-motion';
import { Activity, ArrowUpRight, CircleCheck, ShieldAlert } from 'lucide-react';
import { useTypewriter } from '../hooks/useTypewriter';

const riskEvents = [
  '[HIGH] Data exposure detected in public repo',
  '[MEDIUM] Privacy policy missing GDPR clause',
  '[BLOCKED] Phishing domain flagged',
];

function RiskFeed() {
  const reducedMotion = useReducedMotion();
  const currentLine = useTypewriter(riskEvents[0], 38);

  return (
    <div className="cg-risk-feed" aria-label="Illustrative risk event feed">
      <div className="cg-risk-feed__header">
        <span><span className="cg-live-dot" /> LIVE RISK FEED</span>
        <span className="cg-mono">DEMO</span>
      </div>
      <div className="cg-risk-feed__lines" aria-live="polite">
        <p className="is-high">{currentLine}<span className="cg-caret" /></p>
        {riskEvents.slice(1).map((event, index) => (
          <motion.p
            animate={{ opacity: 1, x: 0 }}
            className={index === 0 ? 'is-medium' : 'is-blocked'}
            initial={reducedMotion ? false : { opacity: 0, x: 8 }}
            key={event}
            transition={{ delay: reducedMotion ? 0 : 1.5 + index * 0.55 }}
          >
            {event}
          </motion.p>
        ))}
      </div>
    </div>
  );
}

export default function RiskDashboardMock() {
  return (
    <div className="cg-dashboard-float">
      <div className="cg-dashboard">
        <div className="cg-dashboard__top">
          <div className="cg-dots" aria-hidden="true"><i /><i /><i /></div>
          <span className="cg-mono">CYBERGUARD / OVERVIEW</span>
          <span className="cg-dashboard__secure"><CircleCheck size={13} /> SYSTEM READY</span>
        </div>
        <div className="cg-dashboard__body">
          <div className="cg-dashboard__title-row">
            <div>
              <span className="cg-overline">UNIFIED RISK POSTURE</span>
              <h2>Threat overview</h2>
            </div>
            <span className="cg-dashboard__range">Last scan <ArrowUpRight size={13} /></span>
          </div>
          <div className="cg-dashboard__grid">
            <div className="cg-score-card">
              <div className="cg-score-ring" role="img" aria-label="Illustrative overall risk score 27 out of 100">
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle cx="60" cy="60" r="50" className="cg-score-ring__track" />
                  <motion.circle
                    animate={{ strokeDashoffset: 229 }}
                    className="cg-score-ring__value"
                    cx="60"
                    cy="60"
                    initial={{ strokeDashoffset: 314 }}
                    r="50"
                    transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                  />
                </svg>
                <span><strong>27</strong><small>/ 100</small></span>
              </div>
              <div className="cg-score-card__caption"><span className="cg-live-dot" /> LOW EXPOSURE</div>
              <span className="cg-score-card__fine">ILLUSTRATIVE SCORE</span>
            </div>
            <div className="cg-dashboard__signals">
              <div className="cg-signal-row"><span><ShieldAlert size={14} /> Digital</span><strong className="is-cyan">12 <small>signals</small></strong></div>
              <div className="cg-signal-row"><span><Activity size={14} /> Legal</span><strong className="is-violet">08 <small>signals</small></strong></div>
              <div className="cg-signal-row"><span><CircleCheck size={14} /> Privacy</span><strong className="is-mint">04 <small>signals</small></strong></div>
              <div className="cg-mini-chart" aria-hidden="true">
                {[30, 48, 36, 62, 44, 78, 55, 68, 42, 87, 60, 74, 48, 65, 92, 55, 73, 46, 80, 61].map((height, index) => (
                  <i key={index} style={{ '--bar-height': `${height}%`, '--bar-delay': `${index * 24}ms` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <RiskFeed />
      </div>
      <div className="cg-float-chip cg-float-chip--top"><span className="cg-chip-icon"><ShieldAlert size={16} /></span><span><b>Signal isolated</b><small>Evidence attached</small></span><i /></div>
      <div className="cg-float-chip cg-float-chip--bottom"><span className="cg-chip-icon is-violet"><Activity size={16} /></span><span><b>Risk score updated</b><small>Analysis complete</small></span><span className="cg-mono">−12%</span></div>
    </div>
  );
}
