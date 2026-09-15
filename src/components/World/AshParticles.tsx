import { useEffect, useRef } from 'react';

interface AshParticlesProps { count?: number; particleImageUrl?: string }

export default function AshParticles({ count = 20, particleImageUrl }: AshParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let disposed = false;
    let sprite: HTMLImageElement | null = null;
    let frame = 0;
    let lastTime = performance.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: 8 + Math.random() * 12, speed: 8 + Math.random() * 15,
      phase: Math.random() * Math.PI * 2,
    }));
    const draw = (time: number) => {
      if (disposed) return;
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        if (!reducedMotion) {
          p.y -= p.speed * dt;
          p.x += Math.sin(time / 2000 + p.phase) * dt * 6;
          if (p.y < -p.size) { p.y = canvas.height + p.size; p.x = Math.random() * canvas.width; }
        }
        ctx.globalAlpha = sprite ? 0.2 : 0.4;
        if (sprite) ctx.drawImage(sprite, p.x, p.y, p.size, p.size);
        else {
          ctx.fillStyle = '#ded8bc';
          ctx.beginPath(); ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };
    if (particleImageUrl) {
      const image = new Image();
      image.onload = () => { if (!disposed) { sprite = image; if (reducedMotion) draw(performance.now()); } };
      image.src = particleImageUrl;
    }
    frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => { disposed = true; cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, [count, particleImageUrl]);
  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-[1]" />;
}
