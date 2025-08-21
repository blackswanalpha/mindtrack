// Loading utility functions and constants

export const LOADING_MESSAGES = {
  // General loading messages
  INITIALIZING: 'Initializing platform...',
  LOADING: 'Loading...',
  PROCESSING: 'Processing your request...',
  SAVING: 'Saving changes...',
  UPDATING: 'Updating data...',
  DELETING: 'Deleting item...',
  
  // Authentication messages
  SIGNING_IN: 'Signing you in...',
  SIGNING_OUT: 'Signing you out...',
  REGISTERING: 'Creating your account...',
  VERIFYING: 'Verifying credentials...',
  
  // Questionnaire specific messages
  LOADING_QUESTIONNAIRE: 'Loading questionnaire...',
  SAVING_RESPONSE: 'Saving your response...',
  ANALYZING_RESULTS: 'Analyzing results...',
  GENERATING_REPORT: 'Generating report...',
  
  // Data operations
  FETCHING_DATA: 'Fetching data...',
  SYNCING_DATA: 'Syncing data...',
  UPLOADING_FILE: 'Uploading file...',
  DOWNLOADING_FILE: 'Downloading file...',
  
  // AI operations
  AI_ANALYZING: 'AI is analyzing responses...',
  GENERATING_INSIGHTS: 'Generating insights...',
  PROCESSING_RECOMMENDATIONS: 'Processing recommendations...',
  
  // Success messages
  SUCCESS: 'Operation completed successfully!',
  SAVED: 'Changes saved successfully!',
  UPLOADED: 'File uploaded successfully!',
  SENT: 'Message sent successfully!',
  
  // Ready states
  READY: 'Ready to go!',
  COMPLETE: 'Complete!',
  WELCOME: 'Welcome to MindTrack',
};

export const LOADING_DURATIONS = {
  MICRO: 150,      // Button clicks, toggles
  FAST: 300,       // Quick transitions
  STANDARD: 500,   // Normal loading
  SLOW: 1000,      // Complex operations
  SPLASH: 2500,    // Splash screen minimum
};

// Simulate realistic loading with variable progress
export const simulateProgress = (
  onProgress: (progress: number) => void,
  duration: number = 2000,
  steps: number = 20
): Promise<void> => {
  return new Promise((resolve) => {
    let currentProgress = 0;
    const stepDuration = duration / steps;
    
    const updateProgress = () => {
      if (currentProgress >= 100) {
        onProgress(100);
        resolve();
        return;
      }
      
      // Simulate realistic loading with variable increments
      const increment = Math.random() * (100 / steps) + (100 / steps) * 0.5;
      currentProgress = Math.min(currentProgress + increment, 100);
      onProgress(Math.round(currentProgress));
      
      // Variable timing to simulate real loading
      const nextDelay = stepDuration * (0.5 + Math.random());
      setTimeout(updateProgress, nextDelay);
    };
    
    updateProgress();
  });
};

// Debounced loading state to prevent flickering
export const createDebouncedLoader = (delay: number = 200) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let isLoading = false;
  
  return {
    show: (callback: () => void) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (!isLoading) {
        timeoutId = setTimeout(() => {
          isLoading = true;
          callback();
        }, delay);
      }
    },
    
    hide: (callback: () => void) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      if (isLoading) {
        isLoading = false;
        callback();
      }
    },
    
    isActive: () => isLoading
  };
};

// Loading state machine
export type LoadingPhase = 'idle' | 'initializing' | 'loading' | 'processing' | 'finalizing' | 'complete' | 'error';

export interface LoadingPhaseConfig {
  message: string;
  duration?: number;
  progress?: number;
}

export const createLoadingSequence = (phases: Record<LoadingPhase, LoadingPhaseConfig>) => {
  return {
    phases,
    getPhaseMessage: (phase: LoadingPhase) => phases[phase]?.message || 'Loading...',
    getPhaseProgress: (phase: LoadingPhase) => phases[phase]?.progress || 0,
    getPhaseDuration: (phase: LoadingPhase) => phases[phase]?.duration || 1000,
  };
};

// Common loading sequences
export const QUESTIONNAIRE_LOADING_SEQUENCE = createLoadingSequence({
  idle: { message: LOADING_MESSAGES.READY, progress: 0 },
  initializing: { message: LOADING_MESSAGES.INITIALIZING, progress: 10, duration: 500 },
  loading: { message: LOADING_MESSAGES.LOADING_QUESTIONNAIRE, progress: 40, duration: 1000 },
  processing: { message: LOADING_MESSAGES.PROCESSING, progress: 70, duration: 800 },
  finalizing: { message: LOADING_MESSAGES.READY, progress: 90, duration: 300 },
  complete: { message: LOADING_MESSAGES.COMPLETE, progress: 100 },
  error: { message: 'Failed to load questionnaire', progress: 0 },
});

export const AI_ANALYSIS_SEQUENCE = createLoadingSequence({
  idle: { message: LOADING_MESSAGES.READY, progress: 0 },
  initializing: { message: 'Preparing analysis...', progress: 15, duration: 800 },
  loading: { message: LOADING_MESSAGES.AI_ANALYZING, progress: 35, duration: 2000 },
  processing: { message: LOADING_MESSAGES.GENERATING_INSIGHTS, progress: 70, duration: 1500 },
  finalizing: { message: LOADING_MESSAGES.PROCESSING_RECOMMENDATIONS, progress: 90, duration: 500 },
  complete: { message: 'Analysis complete!', progress: 100 },
  error: { message: 'Analysis failed', progress: 0 },
});

// Resource preloader utility
export const preloadResources = async (
  resources: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<{ loaded: string[]; failed: string[] }> => {
  const loaded: string[] = [];
  const failed: string[] = [];
  
  const loadResource = async (url: string): Promise<void> => {
    try {
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        // Preload image
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = url;
        });
      } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
        // Preload video
        const video = document.createElement('video');
        await new Promise<void>((resolve, reject) => {
          video.oncanplaythrough = () => resolve();
          video.onerror = () => reject(new Error(`Failed to load video: ${url}`));
          video.src = url;
          video.load();
        });
      } else if (url.match(/\.(css)$/i)) {
        // Preload CSS
        const link = document.createElement('link');
        await new Promise<void>((resolve, reject) => {
          link.onload = () => resolve();
          link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
          link.rel = 'stylesheet';
          link.href = url;
          document.head.appendChild(link);
        });
      } else {
        // Generic fetch for other resources
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      loaded.push(url);
    } catch (error) {
      console.warn(`Failed to preload resource: ${url}`, error);
      failed.push(url);
    }
    
    onProgress?.(loaded.length + failed.length, resources.length);
  };
  
  // Load resources in parallel with concurrency limit
  const concurrencyLimit = 4;
  const chunks = [];
  for (let i = 0; i < resources.length; i += concurrencyLimit) {
    chunks.push(resources.slice(i, i + concurrencyLimit));
  }
  
  for (const chunk of chunks) {
    await Promise.all(chunk.map(loadResource));
  }
  
  return { loaded, failed };
};

// Loading performance metrics
export const createLoadingMetrics = () => {
  const metrics = new Map<string, { start: number; end?: number; duration?: number }>();
  
  return {
    start: (key: string) => {
      metrics.set(key, { start: performance.now() });
    },
    
    end: (key: string) => {
      const metric = metrics.get(key);
      if (metric) {
        const end = performance.now();
        const duration = end - metric.start;
        metrics.set(key, { ...metric, end, duration });
        return duration;
      }
      return 0;
    },
    
    get: (key: string) => metrics.get(key),
    
    getAll: () => Object.fromEntries(metrics.entries()),
    
    clear: () => metrics.clear(),
    
    report: () => {
      console.group('Loading Performance Metrics');
      metrics.forEach((metric, key) => {
        if (metric.duration) {
          console.log(`${key}: ${metric.duration.toFixed(2)}ms`);
        }
      });
      console.groupEnd();
    }
  };
};

// Global loading metrics instance
export const loadingMetrics = createLoadingMetrics();
