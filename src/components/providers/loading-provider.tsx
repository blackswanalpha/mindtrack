'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SplashScreen } from '@/components/ui/splash-screen';
import { PageLoader } from '@/components/ui/loading-spinner';
import { usePreloader } from '@/hooks/use-loading-state';
import { AnimatePresence } from 'framer-motion';

interface LoadingContextType {
  showSplash: boolean;
  showPageLoader: boolean;
  isAppReady: boolean;
  setShowSplash: (show: boolean) => void;
  setShowPageLoader: (show: boolean) => void;
  setAppReady: (ready: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
  enableSplash?: boolean;
  splashMinDuration?: number;
  preloadResources?: string[];
  skipSplashInDev?: boolean;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  enableSplash = true,
  splashMinDuration = 3000,
  preloadResources = [],
  skipSplashInDev = true
}) => {
  const [showSplash, setShowSplash] = useState(
    enableSplash && !(skipSplashInDev && process.env.NODE_ENV === 'development')
  );
  const [showPageLoader, setShowPageLoader] = useState(false);
  const [isAppReady, setAppReady] = useState(!showSplash);

  // Preload resources
  const {
    progress: preloadProgress,
    isComplete: preloadComplete
  } = usePreloader(preloadResources);

  // Handle app initialization
  useEffect(() => {
    if (!showSplash) {
      setAppReady(true);
      return;
    }

    // Wait for preloading to complete and minimum duration
    const checkReady = () => {
      if (preloadComplete) {
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          setAppReady(true);
        }, 500);
      }
    };

    // Check immediately and set up interval for progress updates
    checkReady();
    const interval = setInterval(checkReady, 100);

    return () => clearInterval(interval);
  }, [showSplash, preloadComplete]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const contextValue: LoadingContextType = {
    showSplash,
    showPageLoader,
    isAppReady,
    setShowSplash,
    setShowPageLoader,
    setAppReady
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen
            key="splash"
            onComplete={handleSplashComplete}
            minDuration={splashMinDuration}
            showProgress={preloadResources.length > 0}
          />
        )}
      </AnimatePresence>

      <PageLoader isLoading={showPageLoader} />

      {isAppReady && children}
    </LoadingContext.Provider>
  );
};

// Higher-order component for lazy loading pages
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const LazyComponent = React.lazy(() => Promise.resolve({ default: Component }));

  return React.forwardRef<any, P>((props, ref) => (
    <React.Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <PageLoader isLoading={true} />
          </div>
        )
      }
    >
      <LazyComponent {...props} ref={ref} />
    </React.Suspense>
  ));
};

// Route-based loading component
interface RouteLoaderProps {
  isLoading: boolean;
  error?: Error | null;
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

export const RouteLoader: React.FC<RouteLoaderProps> = ({
  isLoading,
  error,
  children,
  fallback,
  errorFallback
}) => {
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {errorFallback || (
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {fallback || <PageLoader isLoading={true} />}
      </div>
    );
  }

  return <>{children}</>;
};

// Loading boundary component for error handling
interface LoadingBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface LoadingBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class LoadingBoundary extends React.Component<
  LoadingBoundaryProps,
  LoadingBoundaryState
> {
  constructor(props: LoadingBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): LoadingBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LoadingBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <RouteLoader
          isLoading={false}
          error={this.state.error}
          fallback={this.props.fallback}
        >
          {null}
        </RouteLoader>
      );
    }

    return this.props.children;
  }
}

// App initialization hook
export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const { setShowPageLoader } = useLoading();

  const initialize = async (initFunctions: (() => Promise<void>)[]) => {
    setShowPageLoader(true);
    setInitError(null);

    try {
      // Run initialization functions in sequence
      for (const initFn of initFunctions) {
        await initFn();
      }
      setIsInitialized(true);
    } catch (error) {
      setInitError(error instanceof Error ? error : new Error('Initialization failed'));
    } finally {
      setShowPageLoader(false);
    }
  };

  return {
    isInitialized,
    initError,
    initialize
  };
};
