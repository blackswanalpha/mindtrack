import { Variants, Transition } from 'framer-motion';

// Animation timing constants based on documentation
export const ANIMATION_DURATION = {
  MICRO: 0.15,      // 150ms - button clicks, toggles
  STANDARD: 0.25,   // 250ms - page transitions, modals
  COMPLEX: 0.35,    // 350ms - elaborate reveals, celebrations
} as const;

// Easing functions from documentation
export const EASING = {
  DEFAULT: [0.4, 0, 0.2, 1],     // smooth acceleration and deceleration
  ENTRANCE: [0, 0, 0.2, 1],      // quick start, gentle end
  EXIT: [0.4, 0, 1, 1],          // gentle start, quick end
  SHARP: [0.4, 0, 0.6, 1],       // quick acceleration and deceleration
} as const;

// Check for reduced motion preference (safe for SSR)
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

// Create transition with reduced motion support
export const createTransition = (
  duration: number = ANIMATION_DURATION.STANDARD,
  easing: number[] = EASING.DEFAULT
): Transition => ({
  duration: prefersReducedMotion() ? 0 : duration,
  ease: easing,
});

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: -10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: createTransition(ANIMATION_DURATION.STANDARD, EASING.ENTRANCE),
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: createTransition(ANIMATION_DURATION.STANDARD, EASING.EXIT),
  },
};

// Staggered container variants
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: prefersReducedMotion() ? 0 : 0.05,
      delayChildren: prefersReducedMotion() ? 0 : 0.1,
    },
  },
};

// Staggered item variants
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: createTransition(ANIMATION_DURATION.STANDARD, EASING.ENTRANCE),
  },
};

// Fade in variants
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: createTransition(ANIMATION_DURATION.STANDARD),
  },
};

// Slide up variants
export const slideUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: createTransition(ANIMATION_DURATION.STANDARD, EASING.ENTRANCE),
  },
};

// Slide in from left variants
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: createTransition(ANIMATION_DURATION.STANDARD, EASING.ENTRANCE),
  },
};

// Slide in from right variants
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: createTransition(ANIMATION_DURATION.STANDARD, EASING.ENTRANCE),
  },
};

// Scale variants
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: createTransition(ANIMATION_DURATION.STANDARD, EASING.ENTRANCE),
  },
};

// Button hover and tap variants
export const buttonVariants = {
  hover: {
    scale: prefersReducedMotion() ? 1 : 1.02,
    transition: createTransition(ANIMATION_DURATION.MICRO),
  },
  tap: {
    scale: prefersReducedMotion() ? 1 : 0.98,
    transition: createTransition(ANIMATION_DURATION.MICRO),
  },
};

// Card hover variants
export const cardHover = {
  hover: {
    y: prefersReducedMotion() ? 0 : -4,
    boxShadow: prefersReducedMotion() 
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: createTransition(ANIMATION_DURATION.STANDARD),
  },
};

// Icon rotation variants
export const iconRotate: Variants = {
  closed: {
    rotate: 0,
  },
  open: {
    rotate: 180,
    transition: createTransition(ANIMATION_DURATION.STANDARD),
  },
};

// Pulse animation for loading states
export const pulse: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: prefersReducedMotion() ? 0 : 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Modal/Dialog variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: createTransition(ANIMATION_DURATION.STANDARD, EASING.ENTRANCE),
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: createTransition(ANIMATION_DURATION.STANDARD, EASING.EXIT),
  },
};

// Backdrop variants
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: createTransition(ANIMATION_DURATION.STANDARD),
  },
  exit: {
    opacity: 0,
    transition: createTransition(ANIMATION_DURATION.STANDARD),
  },
};

// Notification/Toast variants
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: createTransition(ANIMATION_DURATION.STANDARD, EASING.ENTRANCE),
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.95,
    transition: createTransition(ANIMATION_DURATION.STANDARD, EASING.EXIT),
  },
};

// Progress bar variants
export const progressVariants: Variants = {
  hidden: {
    width: '0%',
  },
  visible: (progress: number) => ({
    width: `${progress}%`,
    transition: createTransition(ANIMATION_DURATION.COMPLEX),
  }),
};

// Skeleton loading variants
export const skeletonVariants: Variants = {
  pulse: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: prefersReducedMotion() ? 0 : 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
