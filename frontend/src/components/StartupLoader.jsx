export default function StartupLoader({ onComplete }) {
  return (
    <div
      className="startup-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading CyberGuard"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onComplete();
      }}
    >
      <div className="startup-loader__content">
        <div className="startup-loader__brand">
          <img className="startup-loader__brand-mark" src="/cyberguard-logo.png" alt="" />
          <span>CYBERGUARD<span className="startup-loader__brand-dot">.</span></span>
        </div>

        <div className="startup-loader__visual" aria-hidden="true">
          <div className="startup-loader__aura" />
          <div className="startup-loader__ring startup-loader__ring--outer" />
          <div className="startup-loader__ring startup-loader__ring--middle" />
          <div className="startup-loader__ring startup-loader__ring--inner" />
          <span className="startup-loader__orbit-dot startup-loader__orbit-dot--one" />
          <span className="startup-loader__orbit-dot startup-loader__orbit-dot--two" />

          <svg className="startup-loader__lock" viewBox="0 0 96 104" fill="none">
            <path
              className="startup-loader__shackle"
              d="M29 43V30c0-11.05 8.95-20 20-20s20 8.95 20 20v13"
            />
            <rect className="startup-loader__lock-body" x="15" y="39" width="68" height="53" rx="13" />
            <circle className="startup-loader__keyhole" cx="49" cy="61" r="5" />
            <path className="startup-loader__keyhole" d="m47 65 2 11 2-11" />
            <path className="startup-loader__lock-glint" d="m21 48 4-4m46 42 5-5" />
          </svg>

          <span className="startup-loader__spark startup-loader__spark--one" />
          <span className="startup-loader__spark startup-loader__spark--two" />
        </div>

        <div className="startup-loader__message">
          <p className="startup-loader__eyebrow">YOUR DIGITAL SHIELD</p>
          <h1>Security, <span>unlocking.</span></h1>
          <p className="startup-loader__caption">Preparing your secure workspace</p>
        </div>

        <div className="startup-loader__progress" aria-hidden="true">
          <span />
        </div>
        <p className="startup-loader__status">
          <span /> INITIALIZING CYBERGUARD
        </p>
      </div>
    </div>
  );
}
