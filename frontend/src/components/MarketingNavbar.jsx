import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { navigation } from '../data/marketingContent';
import MarketingButton from './MarketingButton';
import ShieldLogo from './ShieldLogo';

export default function MarketingNavbar({ onGetProtected }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = navigation
      .map((item) => document.querySelector(item.href))
      .filter(Boolean);
    if (!sections.length) return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(`#${visible.target.id}`);
    }, { rootMargin: '-25% 0px -65% 0px', threshold: [0, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <header className={`cg-navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="cg-navbar__inner">
        <ShieldLogo />
        <nav className="cg-navbar__links" aria-label="Main navigation">
          {navigation.map((item) => (
            <a
              aria-current={active === item.href ? 'location' : undefined}
              className={active === item.href ? 'is-active' : ''}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="cg-navbar__actions">
          <MarketingButton className="cg-button--compact" onClick={onGetProtected}>Get Protected</MarketingButton>
          <button
            aria-expanded={drawerOpen}
            aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="cg-menu-button"
            onClick={() => setDrawerOpen((open) => !open)}
            type="button"
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {drawerOpen && (
          <motion.nav
            animate={{ opacity: 1, x: 0 }}
            aria-label="Mobile navigation"
            className="cg-mobile-drawer"
            exit={{ opacity: 0, x: '100%' }}
            initial={reducedMotion ? false : { opacity: 0, x: '100%' }}
            transition={{ duration: reducedMotion ? 0 : 0.22 }}
          >
            {navigation.map((item) => (
              <a href={item.href} key={item.href} onClick={closeDrawer}>{item.label}</a>
            ))}
            <MarketingButton onClick={() => { closeDrawer(); onGetProtected(); }}>Get Protected</MarketingButton>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
