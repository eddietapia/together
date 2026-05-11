import { motion } from 'framer-motion';
import companionSign from '@/assets/white-blood-cell-with-anit-virus-sign.png';

export function EmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        <motion.div
          className="relative flex h-48 w-48 items-center justify-center rounded-full bg-[#fffdf7]/75 shadow-[0_20px_60px_hsla(25,25%,35%,0.10)] ring-1 ring-black/5"
          animate={{ scale: [1, 1.025, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src={companionSign}
            alt="White blood cell companion holding an anti-virus sign"
            className="h-40 w-40 object-contain"
            draggable={false}
          />
        </motion.div>
        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-foreground/80 tracking-wide">
            All clear
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-1">
            Your companion found no checkpoints awaiting review.
          </p>
        </div>
      </div>
    </div>
  );
}
