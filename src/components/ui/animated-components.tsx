'use client';

import React from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { 
  fadeIn, 
  slideUp, 
  slideInLeft, 
  slideInRight, 
  scaleIn, 
  staggerContainer, 
  staggerItem,
  cardHover,
  buttonVariants,
  modalVariants,
  backdropVariants,
  toastVariants,
  pulse,
  skeletonVariants
} from '@/lib/animations';

// Animated container for staggered children
interface AnimatedContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  stagger?: boolean;
  delay?: number;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({ 
  children, 
  stagger = false, 
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      variants={stagger ? staggerContainer : fadeIn}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated item for use within staggered containers
interface AnimatedItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
}

export const AnimatedItem: React.FC<AnimatedItemProps> = ({ 
  children, 
  animation = 'slideUp',
  ...props 
}) => {
  const variants = {
    fadeIn,
    slideUp,
    slideInLeft,
    slideInRight,
    scaleIn,
  }[animation];

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated card with hover effects
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hover?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  hover = true,
  className = '',
  ...props 
}) => {
  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      whileHover={hover ? cardHover.hover : undefined}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated button with hover and tap effects
interface AnimatedButtonProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle';
  asChild?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'default',
  asChild = false,
  ...props
}) => {
  const hoverScale = variant === 'subtle' ? 1.01 : 1.02;
  const tapScale = variant === 'subtle' ? 0.99 : 0.98;

  // If asChild is true or children contains a button-like element, use div wrapper
  const shouldUseDiv = asChild || React.Children.toArray(children).some(child =>
    React.isValidElement(child) &&
    (child.type === 'button' ||
     (typeof child.type === 'object' && child.type && 'displayName' in child.type &&
      (child.type.displayName === 'Button' || child.type.displayName === 'button')))
  );

  if (shouldUseDiv) {
    return (
      <motion.div
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: tapScale }}
        transition={{ duration: 0.15 }}
        className="inline-block"
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: 0.15 }}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {children}
    </motion.button>
  );
};

// Animated text reveal
interface AnimatedTextProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ 
  children, 
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated modal/dialog
interface AnimatedModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({ 
  children, 
  isOpen, 
  onClose 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Animated notification/toast
interface AnimatedToastProps {
  children: React.ReactNode;
  isVisible: boolean;
}

export const AnimatedToast: React.FC<AnimatedToastProps> = ({ 
  children, 
  isVisible 
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-4 right-4 z-50"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Animated loading skeleton
interface AnimatedSkeletonProps extends HTMLMotionProps<'div'> {
  className?: string;
}

export const AnimatedSkeleton: React.FC<AnimatedSkeletonProps> = ({ 
  className = 'h-4 bg-gray-200 rounded',
  ...props 
}) => {
  return (
    <motion.div
      variants={skeletonVariants}
      animate="pulse"
      className={className}
      {...props}
    />
  );
};

// Animated progress bar
interface AnimatedProgressProps {
  progress: number;
  className?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({ 
  progress, 
  className = 'h-2 bg-gray-200 rounded-full overflow-hidden'
}) => {
  return (
    <div className={className}>
      <motion.div
        className="h-full bg-blue-600 rounded-full"
        initial={{ width: '0%' }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
};

// Animated counter
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 1,
  className = ''
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration, ease: 'easeOut' }}
      >
        {value.toLocaleString()}
      </motion.span>
    </motion.span>
  );
};

// Animated icon with rotation
interface AnimatedIconProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  isRotated?: boolean;
  rotation?: number;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({ 
  children, 
  isRotated = false,
  rotation = 180,
  ...props 
}) => {
  return (
    <motion.div
      animate={{ rotate: isRotated ? rotation : 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated pulse for loading states
interface AnimatedPulseProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  isActive?: boolean;
}

export const AnimatedPulse: React.FC<AnimatedPulseProps> = ({ 
  children, 
  isActive = true,
  ...props 
}) => {
  return (
    <motion.div
      variants={pulse}
      animate={isActive ? 'pulse' : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};
