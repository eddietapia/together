import { useMemo } from "react";
import { motion } from "framer-motion";
import type { SubmissionSummary } from "@/types/submission";
import {
  CATEGORY_VISUALS,
  getSubmissionCategory,
} from "./submissionVisuals";

const STALK_LENGTH = 42;
const HEAD_RADIUS = 14;
const PADDING = 28;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function SpikeTask({
  submission,
  angle,
  radius,
  hovered,
  active,
  departing,
  onHoverChange,
  onActivate,
}: {
  submission: SubmissionSummary;
  angle: number;
  radius: number;
  hovered: boolean;
  active: boolean;
  departing: boolean;
  onHoverChange: (id: string | null) => void;
  onActivate: (id: string) => void;
}) {
  // Both hover and active states drive the same visual emphasis on the head.
  const emphasized = hovered || active;
  // Per-spike unique Brownian jitter pattern + idle pulse phase offset.
  const jitter = useMemo(
    () => ({
      x: [0, rand(-1.2, 1.2), rand(-1.4, 1.4), rand(-1, 1), 0],
      y: [0, rand(-1.2, 1.2), rand(-1.4, 1.4), rand(-1, 1), 0],
      duration: rand(5, 7.5),
      // Stagger the always-on idle pulse so spikes don't synchronize.
      pulseDelay: rand(0, 2.8),
    }),
    [],
  );

  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);
  const angleDeg = (angle * 180) / Math.PI;

  const totalReach = radius + STALK_LENGTH + HEAD_RADIUS + PADDING;
  const SVG_SIZE = totalReach * 2;

  // Center of the spike head (in screen space, relative to wrapper center).
  const headDistance = radius + STALK_LENGTH + HEAD_RADIUS - 3;
  const headX = dirX * headDistance;
  const headY = dirY * headDistance;

  const category = getSubmissionCategory(submission);
  const visual = CATEGORY_VISUALS[category];
  const hue = visual.hue;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: "50%",
        top: "50%",
        width: SVG_SIZE,
        height: SVG_SIZE,
        marginLeft: -SVG_SIZE / 2,
        marginTop: -SVG_SIZE / 2,
      }}
      initial={{ opacity: 0, scale: 0.45 }}
      animate={
        departing
          ? {
              opacity: 0,
              scale: 0.6,
              x: dirX * (radius + STALK_LENGTH * 7.5),
              y: dirY * (radius + STALK_LENGTH * 7.5),
            }
          : {
              opacity: 1,
              scale: 1,
              x: jitter.x,
              y: jitter.y,
            }
      }
      exit={{
        opacity: 0,
        scale: 0.6,
        x: dirX * (radius + STALK_LENGTH * 7.5),
        y: dirY * (radius + STALK_LENGTH * 7.5),
        transition: { duration: 1.6, ease: [0.22, 0.61, 0.36, 1] },
      }}
      transition={
        departing
          ? { duration: 1.5, ease: [0.22, 0.61, 0.36, 1] }
          : {
              x: { duration: jitter.duration, repeat: Infinity, ease: "easeInOut" },
              y: {
                duration: jitter.duration * 1.13,
                repeat: Infinity,
                ease: "easeInOut",
              },
              opacity: { duration: 0.9, ease: "easeOut" },
              scale: { duration: 0.9, ease: [0.22, 0.61, 0.36, 1] },
            }
      }
      onMouseEnter={() => !departing && !active && onHoverChange(submission.id)}
      onMouseLeave={() => !active && onHoverChange(null)}
    >
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`${-totalReach} ${-totalReach} ${SVG_SIZE} ${SVG_SIZE}`}
        className="overflow-visible pointer-events-none"
      >
        <defs>
          <linearGradient
            id={`stalk-${submission.id}`}
            x1="0"
            x2="1"
            y1="0"
            y2="0"
          >
            <stop offset="0%" stopColor={`hsla(${hue}, 60%, 70%, 0)`} />
            <stop offset="25%" stopColor={`hsla(${hue}, 65%, 64%, 0.24)`} />
            <stop offset="65%" stopColor={`hsla(${hue}, 72%, 57%, 0.58)`} />
            <stop offset="100%" stopColor={`hsla(${hue}, 76%, 52%, 0.86)`} />
          </linearGradient>
          <radialGradient
            id={`head-${submission.id}`}
            cx="33%"
            cy="32%"
            r="68%"
          >
            <stop offset="0%" stopColor={`hsla(${hue + 4}, 82%, 94%, 0.96)`} />
            <stop offset="35%" stopColor={`hsla(${hue}, 74%, 78%, 0.78)`} />
            <stop offset="75%" stopColor={`hsla(${hue}, 68%, 58%, 0.44)`} />
            <stop offset="100%" stopColor={`hsla(${hue}, 62%, 48%, 0)`} />
          </radialGradient>
        </defs>

        <g transform={`rotate(${angleDeg})`}>
          {/* Tapered stalk */}
          <path
            d={`
              M ${radius - 2} -4
              C ${radius + STALK_LENGTH * 0.28} -5.5,
                ${radius + STALK_LENGTH * 0.72} -7,
                ${radius + STALK_LENGTH} -5.5
              L ${radius + STALK_LENGTH} 5.5
              C ${radius + STALK_LENGTH * 0.72} 7,
                ${radius + STALK_LENGTH * 0.28} 5.5,
                ${radius - 2} 4
              Z
            `}
            fill={`url(#stalk-${submission.id})`}
            opacity={emphasized ? 0.95 : 0.72}
          />

          <circle
            cx={radius + 2}
            cy={0}
            r={8}
            fill={`hsla(${hue}, 62%, 70%, ${emphasized ? 0.34 : 0.2})`}
          />

          {/* Soft outer head bloom */}
          <circle
            cx={radius + STALK_LENGTH + HEAD_RADIUS - 3}
            cy={0}
            r={HEAD_RADIUS + 7}
            fill={`hsla(${hue}, 74%, 72%, ${emphasized ? 0.42 : 0.2})`}
            style={{ filter: "blur(5px)" }}
          />

          {/* Head body */}
          <circle
            cx={radius + STALK_LENGTH + HEAD_RADIUS - 3}
            cy={0}
            r={HEAD_RADIUS}
            fill={`url(#head-${submission.id})`}
            opacity={emphasized ? 1 : 0.88}
          />

          {/* Inner cream highlight */}
          <circle
            cx={radius + STALK_LENGTH + HEAD_RADIUS - 5.5}
            cy={-2}
            r={HEAD_RADIUS - 6.5}
            fill={`hsla(${hue + 5}, 78%, 93%, 0.78)`}
            opacity={emphasized ? 1 : 0.7}
          />

          {/* Pulse ring — always on; amplifies on emphasis */}
          <motion.circle
            cx={radius + STALK_LENGTH + HEAD_RADIUS - 3}
            cy={0}
            r={HEAD_RADIUS}
            fill="none"
            stroke={`hsla(${hue}, 74%, 54%, ${emphasized ? 0.7 : 0.48})`}
            strokeWidth={1}
            initial={{ scale: 1, opacity: emphasized ? 0.7 : 0.45 }}
            animate={{
              scale: emphasized ? 1.42 : 1.18,
              opacity: 0,
            }}
            transition={{
              duration: emphasized ? 0.9 : 2.6,
              delay: emphasized ? 0 : jitter.pulseDelay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{
              transformOrigin: `${radius + STALK_LENGTH + HEAD_RADIUS - 3}px 0px`,
            }}
          />
        </g>
      </svg>

      {/* Click target — only on the head */}
      <button
        type="button"
        data-spike-pinned="true"
        onClick={() => onActivate(submission.id)}
        disabled={departing}
        aria-label={`Preview: ${submission.title}`}
        className="absolute outline-none p-0 bg-transparent border-0 cursor-pointer pointer-events-auto rounded-full focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:cursor-default"
        style={{
          left: `calc(50% + ${headX}px)`,
          top: `calc(50% + ${headY}px)`,
          width: HEAD_RADIUS * 2.6,
          height: HEAD_RADIUS * 2.6,
          transform: "translate(-50%, -50%)",
        }}
      />
    </motion.div>
  );
}
