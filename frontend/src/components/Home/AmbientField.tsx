import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Mote {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  hue: number;
  drift: { x: number[]; y: number[] };
  opacity: number;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function AmbientField({ count = 18 }: { count?: number }) {
  const motes = useMemo<Mote[]>(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: rand(-420, 420),
      y: rand(-300, 300),
      size: rand(1.5, 4),
      duration: rand(18, 32),
      delay: rand(0, 10),
      hue: rand(20, 45),
      drift: {
        x: [0, rand(-26, 26), rand(-18, 18), rand(-22, 22), 0],
        y: [0, rand(-22, 22), rand(-14, 14), rand(-18, 18), 0],
      },
      opacity: rand(0.08, 0.22),
    }));
  }, [count]);

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
    >
      {motes.map(m => (
        <motion.span
          key={m.id}
          className="absolute rounded-full"
          style={{
            left: `calc(50% + ${m.x}px)`,
            top: `calc(50% + ${m.y}px)`,
            width: m.size,
            height: m.size,
            background: `radial-gradient(circle, hsla(${m.hue}, 65%, 75%, 0.95), hsla(${m.hue}, 55%, 60%, 0))`,
            opacity: m.opacity,
            filter: 'blur(0.6px)',
          }}
          animate={{ x: m.drift.x, y: m.drift.y }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
