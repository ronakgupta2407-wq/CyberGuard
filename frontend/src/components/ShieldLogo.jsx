import { motion, useReducedMotion } from 'framer-motion';
import { brand } from '../data/brand';

export default function ShieldLogo({ size = 38, showName = true, className = '' }) {
  const reducedMotion = useReducedMotion();

  return (
    <a className={`cg-brand ${className}`} href="#top" aria-label={`${brand.name} home`}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        role="img"
        aria-label={`${brand.name} shield logo`}
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <path
          d="M24 3.5 40 9v12.7c0 10.1-6.4 18.3-16 22.8C14.4 40 8 31.8 8 21.7V9l16-5.5Z"
          fill="rgba(0,229,255,.07)"
          stroke="url(#shield-stroke)"
          strokeWidth="1.7"
        />
        <path d="M13.5 13.2 24 9.6l10.5 3.6v8.4c0 6.8-4 12.7-10.5 16-6.5-3.3-10.5-9.2-10.5-16v-8.4Z" stroke="rgba(0,229,255,.22)" />
        <path d="M12.5 23h6l3.1-5.2 4.7 12.4 3.2-7.2h6" stroke="#00e5ff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="23" r="2.1" fill="#e6edf7" />
        <circle cx="24" cy="23" r="4.3" stroke="#00e5ff" strokeOpacity=".7" />
        <defs>
          <linearGradient id="shield-stroke" x1="8" y1="4" x2="43" y2="43" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00e5ff" />
            <stop offset="1" stopColor="#7c5cff" />
          </linearGradient>
        </defs>
      </motion.svg>
      {showName && <span className="cg-brand-name">Cyber<span>Guard</span></span>}
    </a>
  );
}
