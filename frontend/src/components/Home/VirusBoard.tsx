import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SubmissionSummary } from "@/types/submission";
import { VirusModel, CAPSID_RADIUS } from "./VirusModel";
import { SpikeTask } from "./SpikeTask";
import { Particles } from "./Particles";
import { AmbientField } from "./AmbientField";
import { SpikePreviewCard } from "./SpikePreviewCard";
import {
  CATEGORY_VISUALS,
  type SubmissionCategory,
  getSubmissionCategory,
} from "./submissionVisuals";
// CAPSID_RADIUS lives in VirusModel and stays at the original SVG-era value
// (140). Adjust IMAGE_SIZE in VirusModel manually so the image lines up.

const REVIEW_TRANSITION_MS = 1300;

export function VirusBoard({
  spikes,
  initialOrder,
  initialCount,
  loading,
  onReview,
}: {
  spikes: SubmissionSummary[];
  initialOrder: string[];
  initialCount: number;
  loading: boolean;
  onReview: (id: string) => void;
}) {
  const stability = initialCount > 0 ? spikes.length / initialCount : 0;
  const dead = !loading && initialCount > 0 && spikes.length === 0;
  const spikeById = new Map(spikes.map((s) => [s.id, s]));

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [departingId, setDepartingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<SubmissionCategory | null>(null);
  const navigateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [trailParticles, setTrailParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const trailIdRef = useRef(0);

  useEffect(
    () => () => {
      if (navigateTimeout.current) clearTimeout(navigateTimeout.current);
    },
    [],
  );

  // Click anywhere outside a spike or the card to dismiss the active card.
  useEffect(() => {
    if (!activeId) return;
    function handleDocPointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-spike-pinned='true']")) return;
      setActiveId(null);
    }
    document.addEventListener("pointerdown", handleDocPointerDown);
    return () =>
      document.removeEventListener("pointerdown", handleDocPointerDown);
  }, [activeId]);

  // Activate (pin the card) on click. Clicking the same spike again clears it.
  function activateSpike(id: string) {
    if (departingId) return;
    setActiveId((current) => (current === id ? null : id));
  }

  // Card "Review →" button → run the detach animation, then navigate.
  function triggerReview(id: string) {
    if (departingId) return;
    setDepartingId(id);
    setActiveId(null);
    setHoveredId(null);
    navigateTimeout.current = setTimeout(() => {
      onReview(id);
    }, REVIEW_TRANSITION_MS);
  }

  // Filtered set of spike IDs to show (null filter = all).
  const visibleIds = new Set(
    categoryFilter
      ? spikes
          .filter((s) => getSubmissionCategory(s) === categoryFilter)
          .map((s) => s.id)
      : spikes.map((s) => s.id),
  );

  // Card visible whenever a spike is pinned, not departing, and still visible.
  const previewSubmission =
    activeId && activeId !== departingId && visibleIds.has(activeId)
      ? (spikeById.get(activeId) ?? null)
      : null;

  const categoryCounts = spikes.reduce(
    (counts, spike) => {
      const category = getSubmissionCategory(spike);
      counts[category] += 1;
      return counts;
    },
    {
      "high-impact": 0,
      conflicting: 0,
      "low-risk": 0,
    } satisfies Record<SubmissionCategory, number>,
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Subtle warm vignette — kept tight + low-opacity so it reads as ambient
          glow under the virus rather than tinting the whole pane. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsla(36, 40%, 88%, 0.25) 0%, hsla(32, 30%, 92%, 0.08) 28%, transparent 55%)",
        }}
      />

      <AmbientField count={18} />

      <div className="relative h-full w-full">
        {/* Drag trail particles */}
        <AnimatePresence>
          {trailParticles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 0, opacity: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute pointer-events-none"
              style={{
                left: p.x,
                top: p.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: 8 + Math.random() * 6,
                  height: 8 + Math.random() * 6,
                  background: "hsla(36, 40%, 78%, 0.5)",
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Shared bounce + float wrapper around the orb AND its interactive
            spikes — so they move together as one assembly. */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 0.55, opacity: 0, y: 80 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          drag
          dragConstraints={{ left: -100, right: 100, top: -80, bottom: 80 }}
          dragElastic={0.15}
          dragSnapToOrigin
          whileDrag={{ scale: 1.02, cursor: "grabbing" }}
          onDrag={(_e, { point }) => {
            // Spawn trail particles during drag
            if (Math.random() > 0.6) {
              const id = trailIdRef.current++;
              setTrailParticles((prev) => [
                ...prev,
                { id, x: point.x, y: point.y },
              ]);
              // Remove particle after animation
              setTimeout(() => {
                setTrailParticles((prev) => prev.filter((p) => p.id !== id));
              }, 800);
            }
          }}
          transition={{
            scale: {
              type: "spring",
              stiffness: 95,
              damping: 9,
              mass: 0.85,
              delay: 0.15,
            },
            y: {
              type: "spring",
              stiffness: 90,
              damping: 8,
              mass: 0.95,
              delay: 0.15,
            },
            opacity: { duration: 0.5, ease: "easeOut", delay: 0.15 },
          }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ y: [0, -22, 0] }}
            transition={{
              duration: 4.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <VirusModel stability={stability} />

            <AnimatePresence>
              {initialOrder.map((id, idx) => {
                const submission = spikeById.get(id);
                if (!submission || !visibleIds.has(id)) return null;
                const angle =
                  (idx / Math.max(initialCount, 1)) * Math.PI * 2 - Math.PI / 2;
                return (
                  <SpikeTask
                    key={id}
                    submission={submission}
                    angle={angle}
                    radius={CAPSID_RADIUS}
                    hovered={hoveredId === id}
                    active={activeId === id}
                    departing={departingId === id}
                    onHoverChange={setHoveredId}
                    onActivate={activateSpike}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <Particles triggered={dead} />

        {/* Fixed top-right preview card — populated by whichever spike is pinned.
            Lives outside per-spike geometry so it never clips into the sidebar
            or past the viewport edge. */}
        <SpikePreviewCard
          submission={previewSubmission}
          onReview={triggerReview}
          onClose={() => setActiveId(null)}
        />

        {dead && (
          <div
            className="absolute left-1/2 top-1/2 pointer-events-none text-center"
            style={{
              transform: "translate(-50%, calc(-50% + 230px))",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 1.4, ease: "easeOut" }}
            >
              <p className="text-sm font-medium text-foreground/75 tracking-wide">
                All submissions reviewed
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-1">
                The structure has dissolved.
              </p>
            </motion.div>
          </div>
        )}

        {!dead && (
          <div className="absolute left-1/2 bottom-6 -translate-x-1/2 flex flex-col items-center gap-4">
            <div className="rounded-2xl border border-black/5 bg-[#fffdf7]/80 px-5 py-3 shadow-[0_12px_34px_hsla(25,25%,35%,0.08)] backdrop-blur-md">
              <div className="flex items-center gap-2">
                {(
                  [
                    "high-impact",
                    "conflicting",
                    "low-risk",
                  ] as SubmissionCategory[]
                ).map((category, i) => {
                  const visual = CATEGORY_VISUALS[category];
                  const isActive = categoryFilter === category;
                  return (
                    <>
                      {i > 0 && (
                        <div
                          key={`sep-${category}`}
                          className="w-px h-7 bg-black/8 mx-1 flex-shrink-0"
                        />
                      )}
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          setCategoryFilter((prev) =>
                            prev === category ? null : category,
                          )
                        }
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all ${
                          isActive
                            ? "bg-black/6 ring-1 ring-black/10"
                            : "hover:bg-black/4"
                        }`}
                      >
                        <span
                          className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform"
                          style={{
                            background: visual.soft,
                            transform: isActive ? "scale(1.1)" : "scale(1)",
                          }}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: visual.accent }}
                          />
                        </span>
                        <span className="text-left">
                          <span className="block text-xs font-semibold text-foreground">
                            {visual.label}
                          </span>
                          <span className="block text-[10px] text-muted-foreground">
                            {isActive
                              ? `${visibleIds.size} shown`
                              : `${categoryCounts[category]} · ${visual.description}`}
                          </span>
                        </span>
                      </button>
                    </>
                  );
                })}
              </div>
            </div>

            <p className="rounded-full bg-[#fffdf7]/65 px-4 py-2 text-[11px] font-medium text-muted-foreground shadow-[0_8px_24px_hsla(25,25%,35%,0.06)] backdrop-blur-md pointer-events-none">
              {categoryFilter
                ? `Showing ${CATEGORY_VISUALS[categoryFilter].label.toLowerCase()} only · click again to clear`
                : "Click a spike to preview. Review from the card."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
