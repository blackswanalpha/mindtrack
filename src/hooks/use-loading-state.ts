'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface LoadingOptions {
  minDuration?: number;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseLoadingStateReturn {
  state: LoadingState;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  progress: number;
  execute: <T>(
    asyncFn: () => Promise<T>,
    options?: LoadingOptions
  ) => Promise<T | null>;
  reset: () => void;
  setProgress: (progress: number) => void;
}

export const useLoadingState = (): UseLoadingStateReturn => {
  const [state, setState] = useState<LoadingState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgressState] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const minDurationRef = useRef<NodeJS.Timeout>();

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
    setProgressState(0);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (minDurationRef.current) clearTimeout(minDurationRef.current);
  }, []);

  const setProgress = useCallback((newProgress: number) => {
    setProgressState(Math.max(0, Math.min(100, newProgress)));
  }, []);

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T | null> => {
    const {
      minDuration = 0,
      timeout = 30000,
      retryAttempts = 0,
      retryDelay = 1000
    } = options;

    setState('loading');
    setError(null);
    setProgressState(0);

    const startTime = Date.now();
    let attempts = 0;

    const attemptExecution = async (): Promise<T | null> => {
      try {
        // Set up timeout
        if (timeout > 0) {
          timeoutRef.current = setTimeout(() => {
            throw new Error(`Operation timed out after ${timeout}ms`);
          }, timeout);
        }

        // Execute the async function
        const result = await asyncFn();

        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Ensure minimum duration
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDuration - elapsed);

        if (remainingTime > 0) {
          await new Promise(resolve => {
            minDurationRef.current = setTimeout(resolve, remainingTime);
          });
        }

        setProgressState(100);
        setState('success');
        return result;

      } catch (err) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const error = err instanceof Error ? err : new Error('Unknown error');

        if (attempts < retryAttempts) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return attemptExecution();
        }

        setError(error);
        setState('error');
        return null;
      }
    };

    return attemptExecution();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (minDurationRef.current) clearTimeout(minDurationRef.current);
    };
  }, []);

  return {
    state,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    error,
    progress,
    execute,
    reset,
    setProgress
  };
};

// Global Loading State Manager
interface GlobalLoadingState {
  [key: string]: {
    isLoading: boolean;
    progress: number;
    error: Error | null;
  };
}

class LoadingStateManager {
  private state: GlobalLoadingState = {};
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  setLoading(key: string, isLoading: boolean, progress = 0, error: Error | null = null) {
    this.state[key] = { isLoading, progress, error };
    this.notify();
  }

  getState(key: string) {
    return this.state[key] || { isLoading: false, progress: 0, error: null };
  }

  getAllStates() {
    return { ...this.state };
  }

  isAnyLoading() {
    return Object.values(this.state).some(state => state.isLoading);
  }

  clear(key: string) {
    delete this.state[key];
    this.notify();
  }

  clearAll() {
    this.state = {};
    this.notify();
  }
}

export const loadingManager = new LoadingStateManager();

// Hook for global loading state
export const useGlobalLoading = (key?: string) => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = loadingManager.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  const setLoading = useCallback((
    keyOrLoading: string | boolean,
    loading?: boolean,
    progress?: number,
    error?: Error | null
  ) => {
    if (typeof keyOrLoading === 'boolean') {
      // If first param is boolean, use default key
      const defaultKey = key || 'default';
      loadingManager.setLoading(defaultKey, keyOrLoading, progress, error);
    } else {
      // If first param is string, it's the key
      loadingManager.setLoading(keyOrLoading, loading || false, progress, error);
    }
  }, [key]);

  const getState = useCallback((stateKey?: string) => {
    return loadingManager.getState(stateKey || key || 'default');
  }, [key]);

  return {
    setLoading,
    getState,
    isAnyLoading: loadingManager.isAnyLoading(),
    allStates: loadingManager.getAllStates(),
    clear: (stateKey?: string) => loadingManager.clear(stateKey || key || 'default'),
    clearAll: () => loadingManager.clearAll()
  };
};

// Preloader hook for resources
export const usePreloader = (resources: string[]) => {
  const [loadedResources, setLoadedResources] = useState<Set<string>>(new Set());
  const [failedResources, setFailedResources] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadResource = async (url: string) => {
      try {
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          // Load image
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          });
        } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
          // Load video
          const video = document.createElement('video');
          await new Promise((resolve, reject) => {
            video.oncanplaythrough = resolve;
            video.onerror = reject;
            video.src = url;
          });
        } else {
          // Load other resources (CSS, JS, etc.)
          await fetch(url);
        }

        setLoadedResources(prev => new Set([...prev, url]));
      } catch (error) {
        setFailedResources(prev => new Set([...prev, url]));
      }
    };

    resources.forEach(loadResource);
  }, [resources]);

  const totalResources = resources.length;
  const loadedCount = loadedResources.size;
  const failedCount = failedResources.size;
  const progress = totalResources > 0 ? (loadedCount / totalResources) * 100 : 100;
  const isComplete = loadedCount + failedCount === totalResources;

  return {
    progress,
    isComplete,
    loadedResources: Array.from(loadedResources),
    failedResources: Array.from(failedResources),
    loadedCount,
    failedCount,
    totalResources
  };
};
