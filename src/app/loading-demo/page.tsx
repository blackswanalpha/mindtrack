'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArtisticLoader,
  BrainLoader,
  DNALoader,
  HeartbeatLoader,
  MolecularLoader,
  FormLoader,
  AnalyticsLoader
} from '@/components/ui/artistic-loaders';
import { 
  LoadingSpinner, 
  PulsingDots, 
  SkeletonLoader,
  PageLoader
} from '@/components/ui/loading-spinner';
import {
  LazyImage,
  LazySection,
  CardSkeleton,
  TableSkeleton,
  ComponentSkeleton
} from '@/components/ui/lazy-loading';
import { AnimatedProgress } from '@/components/ui/animated-components';
import { useLoadingState } from '@/hooks/use-loading-state';
import { motion } from 'framer-motion';

export default function LoadingDemoPage() {
  const [showPageLoader, setShowPageLoader] = useState(false);
  const [progress, setProgress] = useState(0);
  const { state, isLoading, execute, reset } = useLoadingState();

  const simulateLoading = async () => {
    await execute(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
    }, { minDuration: 2000 });
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MindTrack Loading Components Demo
          </h1>
          <p className="text-lg text-gray-600">
            Showcase of artistic loading animations and lazy loading features
          </p>
        </div>

        {/* Artistic Loaders */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Artistic Loaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Brain Loader</CardTitle>
                <CardDescription>Mental health themed neural network animation</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <BrainLoader size={80} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DNA Helix</CardTitle>
                <CardDescription>Genetic research inspired double helix</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <DNALoader size={80} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Heartbeat Monitor</CardTitle>
                <CardDescription>Medical monitoring visualization</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <HeartbeatLoader size={100} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Molecular Structure</CardTitle>
                <CardDescription>Chemical compound visualization</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <MolecularLoader size={80} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Loader</CardTitle>
                <CardDescription>Questionnaire completion animation</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <FormLoader size={80} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics Loader</CardTitle>
                <CardDescription>Data analysis and reporting visualization</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <AnalyticsLoader size={80} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Standard Loaders */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Standard Loading Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spinner - Small</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <LoadingSpinner size="sm" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spinner - Medium</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spinner - Large</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pulsing Dots</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <PulsingDots />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Progress Indicators */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Progress Indicators</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Animated Progress Bar</CardTitle>
                <CardDescription>Smooth progress animation with current value: {Math.round(progress)}%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatedProgress progress={progress} />
                  <Button onClick={simulateProgress}>Simulate Progress</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Skeleton Loaders */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Skeleton Loaders</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Skeleton</CardTitle>
                <CardDescription>Placeholder for card components</CardDescription>
              </CardHeader>
              <CardContent>
                <CardSkeleton />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Table Skeleton</CardTitle>
                <CardDescription>Placeholder for data tables</CardDescription>
              </CardHeader>
              <CardContent>
                <TableSkeleton rows={3} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Lazy Loading */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Lazy Loading Components</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lazy Section</CardTitle>
                <CardDescription>Content loads when scrolled into view</CardDescription>
              </CardHeader>
              <CardContent>
                <LazySection fallback={<ComponentSkeleton />}>
                  <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      This content loaded lazily!
                    </h3>
                    <p className="text-gray-600">
                      This section only renders when it comes into the viewport, 
                      improving initial page load performance.
                    </p>
                  </div>
                </LazySection>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lazy Image</CardTitle>
                <CardDescription>Images with loading states and error handling</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LazyImage
                    src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop"
                    alt="Healthcare professional"
                    className="w-full h-48 object-cover rounded-lg"
                    containerClassName="bg-gray-100 rounded-lg"
                  />
                  <LazyImage
                    src="https://invalid-url-for-demo.jpg"
                    alt="This will show error state"
                    className="w-full h-48 object-cover rounded-lg"
                    containerClassName="bg-gray-100 rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Demos */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Interactive Demos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Loading State Hook</CardTitle>
                <CardDescription>Simulate async operations with loading states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  {isLoading ? (
                    <div className="space-y-4">
                      <ArtisticLoader type="brain" size={60} />
                      <p className="text-sm text-gray-600">Processing...</p>
                    </div>
                  ) : state === 'success' ? (
                    <div className="text-green-600">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p>Success!</p>
                    </div>
                  ) : (
                    <p className="text-gray-600">Ready to simulate loading</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button onClick={simulateLoading} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Simulate Loading'}
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Page Loader</CardTitle>
                <CardDescription>Full-screen loading overlay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Demonstrates a full-screen loading overlay that can be used during 
                  page transitions or major operations.
                </p>
                <Button 
                  onClick={() => {
                    setShowPageLoader(true);
                    setTimeout(() => setShowPageLoader(false), 3000);
                  }}
                >
                  Show Page Loader
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <PageLoader isLoading={showPageLoader} />
      </div>
    </div>
  );
}
