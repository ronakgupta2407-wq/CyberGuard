import { useCanvasNetwork } from '../hooks/useCanvasNetwork';

export default function ParticleNetwork() {
  const canvasRef = useCanvasNetwork();
  return <canvas aria-hidden="true" className="cg-particle-canvas" ref={canvasRef} />;
}
