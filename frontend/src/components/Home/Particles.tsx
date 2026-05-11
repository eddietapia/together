import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
  duration: number;
  hue: number;
  saturation: number;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function Particles({
  count = 42,
  triggered,
}: {
  count?: number;
  triggered: boolean;
}) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      angle: rand(0, Math.PI * 2),
      distance: rand(150, 340),
      size: rand(2, 5.5),
      delay: rand(0, 0.7),
      duration: rand(1.8, 3.2),
      hue: rand(22, 48),
      saturation: rand(50, 75),
    }));
  }, [count]);

  if (!triggered) return null;

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
    >
      {particles.map(p => {
        const tx = Math.cos(p.angle) * p.distance;
        const ty = Math.sin(p.angle) * p.distance;
        return (
          <motion.span
            key={p.id}
            initial={{
              left: '50%',
              top: '50%',
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              x: tx,
              y: ty,
              opacity: [0, 0.85, 0],
              scale: [0.5, 1, 0.3],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              background: `radial-gradient(circle, hsla(${p.hue}, ${p.saturation}%, 80%, 0.95), hsla(${p.hue}, ${p.saturation - 10}%, 65%, 0))`,
              filter: 'blur(0.5px)',
            }}
          />
        );
      })}
    </div>
  );
}
