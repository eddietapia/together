import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function Tooltip({
  text,
  subtext,
  anchor,
}: {
  text: string;
  subtext?: string;
  anchor: HTMLElement;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const r = anchor.getBoundingClientRect();
    setPos({ top: r.top + r.height / 2, left: r.right + 8 });
  }, [anchor]);

  if (!pos) return null;

  return createPortal(
    <div
      className="fixed z-50 px-2.5 py-1.5 rounded-md bg-foreground text-background text-xs shadow-md pointer-events-none -translate-y-1/2 animate-fade-in"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="font-medium">{text}</div>
      {subtext && <div className="text-[10px] opacity-70">{subtext}</div>}
    </div>,
    document.body
  );
}
