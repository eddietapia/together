import { motion } from 'framer-motion';

export function EmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        <motion.div
          className="relative w-44 h-44 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 38% 32%, hsla(45, 70%, 92%, 0.7), hsla(30, 55%, 75%, 0.35) 60%, hsla(20, 50%, 60%, 0))',
            filter: 'blur(0.4px)',
          }}
          animate={{ scale: [1, 1.025, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-foreground/80 tracking-wide">
            All caught up
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-1">
            No checkpoints are awaiting review.
          </p>
        </div>
      </div>
    </div>
  );
}
