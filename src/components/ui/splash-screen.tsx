'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedProgress } from '@/components/ui/animated-components';
import { useClientSide } from '@/hooks/use-client-side';

interface SplashScreenProps {
  onComplete?: () => void;
  minDuration?: number;
  showProgress?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDuration = 3000,
  showProgress = true
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<'loading' | 'complete' | 'exit'>('loading');
  const isClient = useClientSide();

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setCurrentPhase('complete');
          
          // Wait a moment then start exit animation
          setTimeout(() => {
            setCurrentPhase('exit');
            setTimeout(() => {
              setIsVisible(false);
              onComplete?.();
            }, 800);
          }, 500);
          
          return 100;
        }
        
        // Simulate realistic loading with variable speed
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 150);

    // Ensure minimum duration
    const minTimer = setTimeout(() => {
      if (progress < 100) {
        setProgress(100);
      }
    }, minDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(minTimer);
    };
  }, [minDuration, onComplete, progress]);

  // Deterministic values for SSR compatibility
  const orbConfigs = [
    { width: 150, height: 180, left: 20, top: 30, color: 'bg-indigo-200/30', duration: 15 },
    { width: 200, height: 160, left: 70, top: 60, color: 'bg-blue-200/30', duration: 18 },
    { width: 120, height: 140, left: 85, top: 20, color: 'bg-purple-200/30', duration: 12 },
    { width: 180, height: 220, left: 15, top: 75, color: 'bg-indigo-200/30', duration: 20 },
    { width: 160, height: 190, left: 60, top: 85, color: 'bg-blue-200/30', duration: 16 },
    { width: 140, height: 170, left: 40, top: 45, color: 'bg-purple-200/30', duration: 14 },
  ];

  const particleConfigs = [
    { left: 25, top: 40, delay: 0.2 },
    { left: 75, top: 20, delay: 0.8 },
    { left: 60, top: 70, delay: 1.2 },
    { left: 30, top: 80, delay: 0.5 },
    { left: 85, top: 35, delay: 1.5 },
    { left: 45, top: 60, delay: 0.9 },
    { left: 20, top: 25, delay: 1.8 },
    { left: 90, top: 75, delay: 0.3 },
    { left: 55, top: 15, delay: 1.1 },
    { left: 35, top: 90, delay: 0.7 },
    { left: 80, top: 50, delay: 1.4 },
    { left: 15, top: 65, delay: 0.6 },
    { left: 70, top: 30, delay: 1.7 },
    { left: 50, top: 85, delay: 0.4 },
    { left: 95, top: 10, delay: 1.3 },
    { left: 10, top: 55, delay: 1.0 },
    { left: 65, top: 95, delay: 0.8 },
    { left: 40, top: 35, delay: 1.6 },
    { left: 85, top: 80, delay: 0.2 },
    { left: 25, top: 70, delay: 1.9 },
  ];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Orbs */}
          {isClient && orbConfigs.map((orb, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${orb.color}`}
              style={{
                width: `${orb.width}px`,
                height: `${orb.height}px`,
                left: `${orb.left}%`,
                top: `${orb.top}%`,
              }}
              animate={{
                x: [0, (i % 2 === 0 ? 30 : -30), 0],
                y: [0, (i % 2 === 0 ? -20 : 20), 0],
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: orb.duration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Geometric Patterns */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-indigo-300/40 rounded-lg"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-24 h-24 border-2 border-blue-300/40 rounded-full"
            animate={{
              rotate: [360, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Particle System */}
          {isClient && particleConfigs.map((particle, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-indigo-400/60 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: particle.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          {/* Logo Animation */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: currentPhase === 'exit' ? 1.2 : 1, 
              rotate: 0 
            }}
            transition={{ 
              duration: 1, 
              ease: 'easeOut',
              type: 'spring',
              stiffness: 100
            }}
          >
            <div className="relative">
              {/* Logo Background Glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full blur-xl opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Logo Icon */}
              <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <motion.div
                  animate={{
                    rotate: currentPhase === 'loading' ? [0, 360] : 0,
                  }}
                  transition={{
                    duration: 3,
                    repeat: currentPhase === 'loading' ? Infinity : 0,
                    ease: 'linear',
                  }}
                >
                  <svg 
                    className="w-10 h-10 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                    />
                  </svg>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
              MindTrack
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Mental Health Platform
            </p>
          </motion.div>

          {/* Loading Animation */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {showProgress && (
              <div className="space-y-4">
                <AnimatedProgress 
                  progress={progress} 
                  className="h-1 bg-gray-200 rounded-full overflow-hidden"
                />
                <motion.p 
                  className="text-sm text-gray-500"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentPhase === 'loading' && 'Initializing platform...'}
                  {currentPhase === 'complete' && 'Ready to go!'}
                  {currentPhase === 'exit' && 'Welcome to MindTrack'}
                </motion.p>
              </div>
            )}

            {/* Pulsing Dots */}
            {!showProgress && (
              <div className="flex justify-center space-x-2 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-indigo-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Success Checkmark Animation */}
          <AnimatePresence>
            {currentPhase === 'complete' && (
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Branding */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <p className="text-xs text-gray-400 text-center">
            Comprehensive Mental Health Assessment Platform
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
