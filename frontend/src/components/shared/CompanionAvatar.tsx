import { useEffect, useState } from 'react';
import companionGif from '@/assets/white-blood-cell-sword.gif';
import companionStill from '@/assets/white-blood-cell-with-sword.png';

const ANIMATION_MS = 15_000;

export function CompanionAvatar({
  alt,
  className,
}: {
  alt: string;
  className?: string;
}) {
  const [animated, setAnimated] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setAnimated(false), ANIMATION_MS);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <img
      src={animated ? companionGif : companionStill}
      alt={alt}
      className={className}
      draggable={false}
    />
  );
}
