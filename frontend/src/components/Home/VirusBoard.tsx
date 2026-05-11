import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SubmissionSummary } from "@/types/submission";
import { VirusModel, CAPSID_RADIUS } from "./VirusModel";
import { SpikeTask } from "./SpikeTask";
import { Particles } from "./Particles";
import { AmbientField } from "./AmbientField";
import { SpikePreviewCard } from "./SpikePreviewCard";
import { matchesSubmissionFilter } from "@/lib/utils";
import {
  type SubmissionCategory,
  getSubmissionCategory,
} from "./submissionVisuals";
import companionSword from "@/assets/white-blood-cell-with-sword.png";
// CAPSID_RADIUS lives in VirusModel and stays at the original SVG-era value
// (140). Adjust IMAGE_SIZE in VirusModel manually so the image lines up.

const REVIEW_TRANSITION_MS = 1300;

export function VirusBoard({
  spikes,
  initialOrder,
  initialCount,
  loading,
  categoryFilter,
  searchFilter,
  onReview,
}: {
  spikes: SubmissionSummary[];
  initialOrder: string[];
  initialCount: number;
  loading: boolean;
  categoryFilter: SubmissionCategory | null;
  searchFilter: string;
  onReview: (id: string) => void;
}) {
  const stability = initialCount > 0 ? spikes.length / initialCount : 0;
  const dead = !loading && initialCount > 0 && spikes.length === 0;
  const spikeById = new Map(spikes.map((s) => [s.id, s]));

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [departingId, setDepartingId] = useState<string | null>(null);
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

  // Filtered set of spike IDs to show.
  const visibleIds = new Set(
    spikes
      .filter((s) => !categoryFilter || getSubmissionCategory(s) === categoryFilter)
      .filter((s) => matchesSubmissionFilter(s, searchFilter))
      .map((s) => s.id),
  );

  // Card visible whenever a spike is pinned, not departing, and still visible.
  const previewSubmission =
    activeId && activeId !== departingId && visibleIds.has(activeId)
      ? (spikeById.get(activeId) ?? null)
      : null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Subtle warm vignette */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, hsla(42, 95%, 72%, 0.22) 0%, hsla(40, 85%, 80%, 0.14) 26%, hsla(38, 70%, 88%, 0.06) 48%, transparent 68%)",
        }}
      />

      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-[43%] h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsla(43, 96%, 78%, 0.16) 0%, hsla(43, 90%, 77%, 0.06) 34%, transparent 63%)",
            boxShadow:
              "0 0 130px hsla(43, 95%, 72%, 0.18), inset 0 0 95px hsla(43, 95%, 82%, 0.12)",
          }}
          animate={{ scale: [0.98, 1.03, 0.98], opacity: [0.72, 0.95, 0.72] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {[0, 1, 2].map((ring) => (
          <motion.div
            key={ring}
            className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              width: 460 + ring * 150,
              height: 460 + ring * 150,
              borderColor: `hsla(43, 96%, 70%, ${0.14 - ring * 0.03})`,
              boxShadow: `0 0 ${28 + ring * 18}px hsla(43, 96%, 72%, ${0.08 - ring * 0.015})`,
            }}
            animate={{
              scale: [1, 1.018 + ring * 0.006, 1],
              opacity: [0.44 - ring * 0.08, 0.72 - ring * 0.1, 0.44 - ring * 0.08],
            }}
            transition={{
              duration: 6.5 + ring * 1.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: ring * 0.55,
            }}
          />
        ))}
        <div
          className="absolute left-1/2 top-[43%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
          style={{
            background:
              "conic-gradient(from 18deg, transparent 0deg, hsla(43, 96%, 72%, 0.10) 36deg, transparent 80deg, transparent 160deg, hsla(43, 96%, 72%, 0.08) 208deg, transparent 270deg, hsla(43, 96%, 72%, 0.06) 318deg, transparent 360deg)",
            filter: "blur(18px)",
          }}
        />
      </div>

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
            if (Math.random() > 0.6) {
              const id = trailIdRef.current++;
              setTrailParticles((prev) => [
                ...prev,
                { id, x: point.x, y: point.y },
              ]);
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
              <img
                src={companionSword}
                alt="White blood cell companion with sword"
                className="mx-auto mb-3 h-24 w-24 object-contain drop-shadow-[0_12px_24px_hsla(25,25%,35%,0.12)]"
                draggable={false}
              />
              <p className="text-sm font-medium text-foreground/75 tracking-wide">
                All checkpoints reviewed
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-1">
                The structure has dissolved.
              </p>
            </motion.div>
          </div>
        )}

        {!dead && visibleIds.size === 0 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-48 rounded-full bg-[#fffdf7]/75 px-4 py-2 text-[11px] font-medium text-muted-foreground shadow-[0_8px_24px_hsla(25,25%,35%,0.06)] backdrop-blur-md pointer-events-none">
            No spikes match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
