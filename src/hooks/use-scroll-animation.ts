'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface UseScrollAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    triggerOnce = true,
    rootMargin = '0px 0px -100px 0px'
  } = options;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    threshold,
    once: triggerOnce,
    margin: rootMargin,
  });

  return { ref, isInView };
};

// Hook for scroll progress
export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress(); // Initial calculation

    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return scrollProgress;
};

// Hook for parallax effect
export const useParallax = (speed: number = 0.5) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const updateOffset = () => {
      setOffset(window.scrollY * speed);
    };

    window.addEventListener('scroll', updateOffset, { passive: true });
    return () => window.removeEventListener('scroll', updateOffset);
  }, [speed]);

  return offset;
};

// Hook for staggered animations
export const useStaggeredAnimation = (itemCount: number, delay: number = 0.1) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { threshold: 0.1, once: true });

  useEffect(() => {
    if (isInView) {
      const timeouts: NodeJS.Timeout[] = [];
      
      for (let i = 0; i < itemCount; i++) {
        const timeout = setTimeout(() => {
          setVisibleItems(prev => [...prev, i]);
        }, i * delay * 1000);
        
        timeouts.push(timeout);
      }

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [isInView, itemCount, delay]);

  return { ref, visibleItems, isInView };
};
