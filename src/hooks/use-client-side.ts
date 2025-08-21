'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to ensure components only render on the client side
 * Prevents hydration mismatches for components with random values or browser-specific APIs
 */
export const useClientSide = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

/**
 * Hook for generating deterministic random values that are consistent between server and client
 * Uses a seed-based approach to ensure the same values are generated on both sides
 */
export const useDeterministicRandom = (seed: string | number = 'default') => {
  // Simple seeded random number generator (LCG algorithm)
  const seededRandom = (seedValue: number) => {
    let x = Math.sin(seedValue) * 10000;
    return x - Math.floor(x);
  };

  // Convert string seed to number
  const numericSeed = typeof seed === 'string' 
    ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : seed;

  const random = (index: number = 0) => {
    return seededRandom(numericSeed + index);
  };

  const randomInRange = (min: number, max: number, index: number = 0) => {
    return min + random(index) * (max - min);
  };

  const randomInt = (min: number, max: number, index: number = 0) => {
    return Math.floor(randomInRange(min, max + 1, index));
  };

  const randomChoice = <T>(array: T[], index: number = 0): T => {
    return array[randomInt(0, array.length - 1, index)];
  };

  return {
    random,
    randomInRange,
    randomInt,
    randomChoice,
  };
};

/**
 * Hook for safe window access that prevents SSR errors
 */
export const useWindow = () => {
  const [windowObj, setWindowObj] = useState<Window | null>(null);

  useEffect(() => {
    setWindowObj(window);
  }, []);

  return windowObj;
};

/**
 * Hook for safe document access that prevents SSR errors
 */
export const useDocument = () => {
  const [documentObj, setDocumentObj] = useState<Document | null>(null);

  useEffect(() => {
    setDocumentObj(document);
  }, []);

  return documentObj;
};

/**
 * Hook for checking if code is running in browser environment
 */
export const useIsBrowser = () => {
  return typeof window !== 'undefined';
};

/**
 * Hook for media query matching that works with SSR
 */
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  const isClient = useClientSide();

  useEffect(() => {
    if (!isClient) return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query, isClient]);

  return matches;
};

/**
 * Hook for checking user's motion preferences
 */
export const usePrefersReducedMotion = () => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};

/**
 * Hook for safe localStorage access
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const isClient = useClientSide();

  useEffect(() => {
    if (!isClient) return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key, isClient]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (isClient) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

/**
 * Hook for safe sessionStorage access
 */
export const useSessionStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const isClient = useClientSide();

  useEffect(() => {
    if (!isClient) return;

    try {
      const item = window.sessionStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
    }
  }, [key, isClient]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (isClient) {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};
