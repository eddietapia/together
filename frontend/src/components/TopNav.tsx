import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Home, ClipboardCheck, FolderTree } from "lucide-react";
import { Tooltip } from "./Tooltip";

export type Section = "home" | "submissions" | "project-files";

export const NAV_ITEMS: Array<{
  section: Section;
  label: string;
  Icon: typeof Home;
}> = [
  { section: "home", label: "Home", Icon: Home },
  { section: "submissions", label: "Checkpoints", Icon: ClipboardCheck },
  { section: "project-files", label: "Project Files", Icon: FolderTree },
];

const tabTransition = {
  type: "spring",
  stiffness: 360,
  damping: 42,
  mass: 0.8,
} as const;

export function TopNav({
  active,
  onSelect,
}: {
  active: Section;
  onSelect: (section: Section) => void;
}) {
  const [hovered, setHovered] = useState<Section | null>(null);
  const refs = useRef<Map<Section, HTMLButtonElement>>(new Map());

  return (
    <div className="flex items-center gap-1 min-w-0 flex-1">
      {NAV_ITEMS.map(({ section, label, Icon }) => {
        const isActive = active === section;
        return (
          <motion.button
            layout
            transition={tabTransition}
            key={section}
            ref={(el) => {
              if (el) refs.current.set(section, el);
              else refs.current.delete(section);
            }}
            onClick={() => onSelect(section)}
            onMouseEnter={() => setHovered(section)}
            onMouseLeave={() => setHovered(null)}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={`relative h-9 flex items-center justify-center rounded-full overflow-hidden transition-colors ${
              isActive
                ? "bg-black/10 text-foreground px-3"
                : "w-9 text-muted-foreground hover:text-foreground hover:bg-black/5"
            }`}
          >
            <motion.span
              layout="position"
              className="flex items-center justify-center"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
            </motion.span>
            {isActive && (
              <motion.span
                layout="position"
                initial={{ opacity: 0, x: -3 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.14, ease: [0.22, 0.61, 0.36, 1] }}
                className="pl-2 text-sm font-medium whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
            {!isActive && hovered === section && refs.current.get(section) && (
              <Tooltip text={label} anchor={refs.current.get(section)!} />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
