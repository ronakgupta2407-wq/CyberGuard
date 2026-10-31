import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export function useTypewriter(text, speed = 42) {
  const reducedMotion = useReducedMotion();
  const [visibleText, setVisibleText] = useState(reducedMotion ? text : '');

  useEffect(() => {
    if (reducedMotion) {
      setVisibleText(text);
      return undefined;
    }

    let position = 0;
    setVisibleText('');
    const timer = window.setInterval(() => {
      position += 1;
      setVisibleText(text.slice(0, position));
      if (position >= text.length) window.clearInterval(timer);
    }, speed);
    return () => window.clearInterval(timer);
  }, [reducedMotion, speed, text]);

  return visibleText;
}
