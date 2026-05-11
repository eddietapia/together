import { useState, useRef } from 'react';
import { PanelLeft } from 'lucide-react';
import { NAV_ITEMS, Section } from './TopNav';
import { Tooltip } from './Tooltip';

export function CollapsedRail({
  active,
  onSelect,
  onExpand,
}: {
  active: Section;
  onSelect: (section: Section) => void;
  onExpand: () => void;
}) {
  const [hovered, setHovered] = useState<Section | 'expand' | null>(null);
  const refs = useRef<Map<Section | 'expand', HTMLButtonElement>>(new Map());

  return (
    <aside className="w-12 flex-shrink-0 flex flex-col h-full bg-[#f5f2eb] border-r border-border items-center py-3 gap-1">
      <button
        ref={el => {
          if (el) refs.current.set('expand', el);
          else refs.current.delete('expand');
        }}
        onClick={onExpand}
        onMouseEnter={() => setHovered('expand')}
        onMouseLeave={() => setHovered(null)}
        aria-label="Expand sidebar"
        className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
      >
        <PanelLeft className="w-4 h-4" />
        {hovered === 'expand' && refs.current.get('expand') && (
          <Tooltip text="Expand sidebar" anchor={refs.current.get('expand')!} />
        )}
      </button>

      <div className="w-6 h-px bg-border my-1" aria-hidden />

      {NAV_ITEMS.map(({ section, label, Icon }) => {
        const isActive = active === section;
        return (
          <button
            key={section}
            ref={el => {
              if (el) refs.current.set(section, el);
              else refs.current.delete(section);
            }}
            onClick={() => onSelect(section)}
            onMouseEnter={() => setHovered(section)}
            onMouseLeave={() => setHovered(null)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
              isActive
                ? 'bg-black/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-black/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            {hovered === section && refs.current.get(section) && (
              <Tooltip text={label} anchor={refs.current.get(section)!} />
            )}
          </button>
        );
      })}
    </aside>
  );
}
