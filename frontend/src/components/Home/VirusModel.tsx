import { motion } from "framer-motion";
import virusImage from "@/assets/virus-image.png";

// Reverted to the original SVG-era anchor radius. Adjust IMAGE_SIZE manually
// to make the image scale match this anchor — don't try to derive it.
export const CAPSID_RADIUS = 140;
export const IMAGE_SIZE = 900;

// Small subtle SVG protein spikes layered on top of the image around the body
// edge. They mimic the look of the image's baked-in decorative spikes but as
// real DOM/SVG so they animate with the capsid.
const DECORATIVE_SPIKES = [
  { angle: -96, length: 34, head: 8, width: 8, opacity: 0.28 },
  { angle: -72, length: 24, head: 6, width: 7, opacity: 0.2 },
  { angle: -51, length: 30, head: 7, width: 8, opacity: 0.24 },
  { angle: -27, length: 22, head: 5.5, width: 6, opacity: 0.16 },
  { angle: -4, length: 32, head: 8, width: 8, opacity: 0.3 },
  { angle: 22, length: 25, head: 6, width: 7, opacity: 0.2 },
  { angle: 44, length: 36, head: 8.5, width: 9, opacity: 0.3 },
  { angle: 68, length: 23, head: 5.5, width: 6, opacity: 0.18 },
  { angle: 91, length: 31, head: 7.5, width: 8, opacity: 0.24 },
  { angle: 116, length: 26, head: 6.5, width: 7, opacity: 0.2 },
  { angle: 139, length: 34, head: 8, width: 8, opacity: 0.28 },
  { angle: 164, length: 23, head: 6, width: 7, opacity: 0.18 },
  { angle: 187, length: 30, head: 7, width: 8, opacity: 0.24 },
  { angle: 211, length: 25, head: 6, width: 7, opacity: 0.18 },
  { angle: 236, length: 36, head: 8.5, width: 9, opacity: 0.3 },
  { angle: 260, length: 22, head: 5.5, width: 6, opacity: 0.16 },
  { angle: 284, length: 32, head: 8, width: 8, opacity: 0.26 },
  { angle: 312, length: 27, head: 6.5, width: 7, opacity: 0.2 },
  { angle: 335, length: 35, head: 8, width: 8, opacity: 0.28 },
];

export function VirusModel({ stability }: { stability: number }) {
  const dying = stability === 0;
  const baseOpacity = 0.45 + 0.55 * stability;
  const asymmetry = 1 - stability;

  return (
    // Positioning + image-specific persistent animations (breath + slow rotate).
    // The on-mount entrance bounce and the vertical float are owned by the
    // shared wrapper in VirusBoard so the orb and the interactive SpikeTasks
    // move together as one assembly.
    <motion.div
      aria-hidden
      className="absolute pointer-events-none"
      style={{
        left: "50%",
        top: "50%",
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        marginLeft: -IMAGE_SIZE / 2,
        marginTop: -IMAGE_SIZE / 2,
      }}
      initial={false}
      animate={
        dying
          ? { scale: [1, 1.55], rotate: [0, 9], opacity: [baseOpacity, 0] }
          : {
              scaleX: [1, 1.012 + asymmetry * 0.025, 1 - asymmetry * 0.018, 1],
              scaleY: [1, 1.018 - asymmetry * 0.03, 1 + asymmetry * 0.022, 1],
              rotate: [0, -0.8 - asymmetry * 0.9, 0.65 + asymmetry * 0.75, 0],
              opacity: baseOpacity,
            }
      }
      transition={
        dying
          ? { duration: 2.6, ease: [0.4, 0, 0.2, 1] }
          : {
              scaleX: { duration: 5.2, repeat: Infinity, ease: "easeInOut" },
              scaleY: { duration: 5.8, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 9.5, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.4, ease: "easeOut" },
            }
      }
    >
      <>
        {/* The virus image itself. mix-blend-multiply makes the near-white
            background blend into the cream backdrop. */}
        <img
          src={virusImage}
          alt=""
          draggable={false}
          className="relative w-full h-full select-none"
          style={{
            objectFit: "contain",
            mixBlendMode: "multiply",
          }}
        />

        {/* Subtle SVG protein-spike overlay anchored at CAPSID_RADIUS. */}
        <motion.svg
          className="absolute inset-0 pointer-events-none"
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
          viewBox={`${-IMAGE_SIZE / 2} ${-IMAGE_SIZE / 2} ${IMAGE_SIZE} ${IMAGE_SIZE}`}
          style={{ overflow: "visible" }}
          animate={
            dying ? { opacity: [1, 0] } : { scale: [1, 1.012, 0.996, 1] }
          }
          transition={
            dying
              ? { duration: 2, ease: [0.4, 0, 0.2, 1] }
              : { duration: 6.4, repeat: Infinity, ease: "easeInOut" }
          }
          opacity={0.85 * stability + 0.2}
        >
          {DECORATIVE_SPIKES.map((spike) => {
            const r = CAPSID_RADIUS;
            const root = r - 4;
            const neck = r + spike.length * 0.58;
            const headX = r + spike.length;
            return (
              <g
                key={spike.angle}
                transform={`rotate(${spike.angle})`}
                opacity={spike.opacity}
              >
                <path
                  d={`
                    M ${root} ${-spike.width / 2}
                    C ${r + 6} ${-spike.width * 0.72},
                      ${neck} ${-spike.width * 0.55},
                      ${headX - spike.head * 0.6} ${-spike.width * 0.4}
                    L ${headX - spike.head * 0.6} ${spike.width * 0.4}
                    C ${neck} ${spike.width * 0.55},
                      ${r + 6} ${spike.width * 0.72},
                      ${root} ${spike.width / 2}
                    Z
                  `}
                  fill="hsla(28, 30%, 56%, 0.6)"
                />
                <circle
                  cx={headX}
                  cy={0}
                  r={spike.head}
                  fill="hsla(30, 36%, 70%, 0.7)"
                />
                <circle
                  cx={headX - spike.head * 0.22}
                  cy={-spike.head * 0.22}
                  r={spike.head * 0.42}
                  fill="hsla(40, 50%, 88%, 0.55)"
                />
              </g>
            );
          })}
        </motion.svg>
      </>
    </motion.div>
  );
}
