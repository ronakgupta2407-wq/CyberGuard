import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export function useCanvasNetwork() {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    const media = window.matchMedia('(pointer: coarse)');
    const pointer = { x: -1000, y: -1000 };
    const points = [];
    let frame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let lastFrameTime = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      points.length = 0;
      const amount = Math.min(64, Math.max(20, Math.round(width / 22)));
      for (let index = 0; index < amount; index += 1) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.24,
          vy: (Math.random() - 0.5) * 0.24,
        });
      }
    };

    const onPointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
    };

    const draw = (timestamp) => {
      if (document.hidden) {
        frame = 0;
        return;
      }
      if (!reducedMotion && timestamp - lastFrameTime < 28) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      lastFrameTime = timestamp;
      context.clearRect(0, 0, width, height);

      for (let first = 0; first < points.length; first += 1) {
        const point = points[first];
        if (!reducedMotion) {
          point.x += point.vx;
          point.y += point.vy;
          if (point.x < 0 || point.x > width) point.vx *= -1;
          if (point.y < 0 || point.y > height) point.vy *= -1;
        }

        const mouseDistance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
        if (mouseDistance < 150 && !media.matches) {
          point.x += ((pointer.x - point.x) / mouseDistance) * 0.13;
          point.y += ((pointer.y - point.y) / mouseDistance) * 0.13;
        }

        context.beginPath();
        context.arc(point.x, point.y, 1.4, 0, Math.PI * 2);
        context.fillStyle = 'rgba(0, 229, 255, 0.55)';
        context.fill();

        for (let second = first + 1; second < points.length; second += 1) {
          const other = points[second];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance < 110) {
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(124, 92, 255, ${0.13 * (1 - distance / 110)})`;
            context.lineWidth = 0.7;
            context.stroke();
          }
        }
      }

      if (!reducedMotion) frame = window.requestAnimationFrame(draw);
    };

    const start = () => {
      if (!frame && !document.hidden) frame = window.requestAnimationFrame(draw);
    };
    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    start();
    window.addEventListener('resize', resize, { passive: true });
    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [reducedMotion]);

  return canvasRef;
}
