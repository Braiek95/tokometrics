import type { Variants, Transition } from "framer-motion";

// ─── Signature Easing Curves ─────────────────────────────────────────────────
// Refined, custom easings — not Framer defaults
export const ease = {
  // Silky entry: fast start, graceful settle
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  // Gentle accelerate-in
  in: [0.55, 0, 1, 0.45] as [number, number, number, number],
  // Symmetric, ultra-smooth
  inOut: [0.45, 0, 0.55, 1] as [number, number, number, number],
} as const;

// ─── Spring Presets ──────────────────────────────────────────────────────────
export const spring = {
  // Snappy, precise — UI controls
  snap: { type: "spring", stiffness: 380, damping: 30 } as any,
  // Responsive, slightly lively — cards, panels
  gentle: { type: "spring", stiffness: 220, damping: 26 } as any,
  // Slow, weighty — page sections
  slow: { type: "spring", stiffness: 120, damping: 22 } as any,
  // Number counters — flows smoothly to target
  counter: { type: "spring", stiffness: 60, damping: 18, mass: 1 } as any,
  // Progress bars — satisfying stretch
  bar: { type: "spring", stiffness: 50, damping: 14 } as any,
};

// ─── Page & Section Entrance ─────────────────────────────────────────────────
export const pageEnter: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.25,
      staggerChildren: 0.09,
      delayChildren: 0.04,
    },
  },
};

export const sectionEnter: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...spring.gentle },
  },
};

// ─── Stagger Container ───────────────────────────────────────────────────────
export const stagger = (
  delay = 0.07,
  initialDelay = 0
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: delay,
      delayChildren: initialDelay,
    },
  },
});

// ─── Item Variants ───────────────────────────────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...spring.gentle },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: ease.out },
  },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...spring.gentle },
  },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...spring.gentle },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...spring.snap },
  },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...spring.gentle },
  },
};

// ─── List Row (used with scroll-triggered inView) ────────────────────────────
export const listRow: Variants = {
  hidden: { opacity: 0, x: -14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...spring.gentle },
  },
};

// ─── Card Interactions ───────────────────────────────────────────────────────
export const cardLift = {
  rest: {
    y: 0,
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.06)",
    transition: spring.snap,
  },
  hover: {
    y: -4,
    boxShadow:
      "0 12px 28px -6px rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.06)",
    transition: spring.snap,
  },
};

// ─── Icon Pulse (for loaded/changed state) ───────────────────────────────────
export const iconPop: Variants = {
  hidden: { scale: 0, rotate: -20, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { ...spring.snap, delay: 0.05 },
  },
};

// ─── Accent Line (top border reveal) ────────────────────────────────────────
export const accentLine = (delay = 0): Variants => ({
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    originX: 0,
    transition: { duration: 0.5, ease: ease.out, delay },
  },
});

// ─── Shimmer Sweep (progress bar polish) ─────────────────────────────────────
export const shimmer = (delay = 0.6): Variants => ({
  hidden: { x: "-100%" },
  visible: {
    x: "200%",
    transition: { duration: 0.8, ease: ease.out, delay },
  },
});

// ─── Breadcrumb Stagger ──────────────────────────────────────────────────────
export const breadcrumbContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const breadcrumbItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: ease.out },
  },
};

// ─── Nav Item Active Indicator ───────────────────────────────────────────────
export const navIndicator: Variants = {
  hidden: { scaleY: 0, originY: 0.5 },
  visible: {
    scaleY: 1,
    originY: 0.5,
    transition: { ...spring.snap },
  },
};

// ─── Backward-Compat Aliases ─────────────────────────────────────────────────
// Allow both old names (staggerContainer, listItem) and new (stagger, listRow)
export const staggerContainer = stagger;
export const listItem = listRow;
