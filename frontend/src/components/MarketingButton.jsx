import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, LoaderCircle } from 'lucide-react';

export default function MarketingButton({
  children,
  variant = 'primary',
  onClick,
  href,
  type = 'button',
  disabled = false,
  loading = false,
  showArrow = true,
  magnetic = true,
  className = '',
  ...props
}) {
  const buttonRef = useRef(null);
  const [ripples, setRipples] = useState([]);
  const reducedMotion = useReducedMotion();
  const isDisabled = disabled || loading;

  const handlePointerMove = (event) => {
    if (!magnetic || reducedMotion || isDisabled || !buttonRef.current) return;
    const bounds = buttonRef.current.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    buttonRef.current.style.setProperty('--mag-x', `${x * 0.08}px`);
    buttonRef.current.style.setProperty('--mag-y', `${y * 0.08}px`);
  };

  const resetMagnet = () => {
    if (!buttonRef.current) return;
    buttonRef.current.style.setProperty('--mag-x', '0px');
    buttonRef.current.style.setProperty('--mag-y', '0px');
  };

  const handleClick = (event) => {
    if (!isDisabled && !reducedMotion) {
      const bounds = buttonRef.current.getBoundingClientRect();
      const id = `${Date.now()}-${Math.random()}`;
      setRipples((current) => [...current, {
        id,
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      }]);
      window.setTimeout(() => {
        setRipples((current) => current.filter((ripple) => ripple.id !== id));
      }, 650);
    }
    onClick?.(event);
  };

  const buttonClass = `cg-button cg-button--${variant} ${className}`.trim();
  const content = (
    <>
      <span className="cg-button__label">{loading && <LoaderCircle aria-hidden="true" size={16} className="cg-spin" />}{children}</span>
      {showArrow && !loading && <ArrowRight aria-hidden="true" size={16} className="cg-button__arrow" />}
      {ripples.map((ripple) => (
        <span
          aria-hidden="true"
          className="cg-button__ripple"
          key={ripple.id}
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
    </>
  );

  const motionProps = {
    ref: buttonRef,
    className: buttonClass,
    onPointerMove: handlePointerMove,
    onPointerLeave: resetMagnet,
    onClick: handleClick,
    whileHover: reducedMotion ? undefined : { y: -2 },
    whileTap: reducedMotion ? undefined : { scale: 0.97 },
    transition: { type: 'spring', stiffness: 360, damping: 24 },
    'aria-busy': loading || undefined,
    ...props,
  };

  if (href) {
    return <motion.a href={href} {...motionProps}>{content}</motion.a>;
  }

  return (
    <motion.button type={type} disabled={isDisabled} {...motionProps}>
      {content}
    </motion.button>
  );
}
