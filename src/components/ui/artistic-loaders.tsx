'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Brain-inspired loader for mental health theme
export const BrainLoader: React.FC<{ size?: number; className?: string }> = ({ 
  size = 60, 
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="absolute inset-0"
      >
        {/* Brain outline */}
        <motion.path
          d="M50 10 C30 10, 15 25, 15 45 C15 55, 20 65, 30 70 C25 75, 25 85, 35 90 C45 95, 55 95, 65 90 C75 85, 75 75, 70 70 C80 65, 85 55, 85 45 C85 25, 70 10, 50 10 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-indigo-500"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
        />
        
        {/* Neural connections */}
        {[...Array(6)].map((_, i) => (
          <motion.circle
            key={i}
            cx={30 + (i % 3) * 20}
            cy={35 + Math.floor(i / 3) * 15}
            r="2"
            fill="currentColor"
            className="text-indigo-400"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.7] }}
            transition={{
              duration: 1.5,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
        
        {/* Pulse effect */}
        <motion.circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-indigo-300"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
};

// DNA Helix Loader
export const DNALoader: React.FC<{ size?: number; className?: string }> = ({ 
  size = 60, 
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* DNA strands */}
        {[0, 1].map((strand) => (
          <motion.path
            key={strand}
            d={strand === 0 
              ? "M20 10 Q50 30 80 50 Q50 70 20 90" 
              : "M80 10 Q50 30 20 50 Q50 70 80 90"
            }
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={strand === 0 ? "text-indigo-500" : "text-blue-500"}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: strand * 0.5
            }}
          />
        ))}
        
        {/* Base pairs */}
        {[...Array(5)].map((_, i) => (
          <motion.line
            key={i}
            x1="30"
            y1={20 + i * 15}
            x2="70"
            y2={20 + i * 15}
            stroke="currentColor"
            strokeWidth="2"
            className="text-purple-400"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 1, 0] }}
            transition={{
              duration: 1,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// Heartbeat Monitor Loader
export const HeartbeatLoader: React.FC<{ size?: number; className?: string }> = ({ 
  size = 80, 
  className = '' 
}) => {
  const heartbeatPath = "M10 50 L20 50 L25 30 L30 70 L35 20 L40 80 L45 50 L90 50";
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size * 0.6 }}>
      <svg width={size} height={size * 0.6} viewBox="0 0 100 60">
        {/* Heartbeat line */}
        <motion.path
          d={heartbeatPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-red-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Pulse dot */}
        <motion.circle
          cx="0"
          cy="50"
          r="3"
          fill="currentColor"
          className="text-red-400"
          initial={{ x: 0 }}
          animate={{ x: [0, 100, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Grid lines */}
        {[...Array(10)].map((_, i) => (
          <line
            key={i}
            x1={i * 10}
            y1="0"
            x2={i * 10}
            y2="60"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-300"
            opacity="0.3"
          />
        ))}
      </svg>
    </div>
  );
};

// Molecular Structure Loader
export const MolecularLoader: React.FC<{ size?: number; className?: string }> = ({ 
  size = 80, 
  className = '' 
}) => {
  const atoms = [
    { x: 50, y: 30, color: 'text-blue-500' },
    { x: 30, y: 60, color: 'text-green-500' },
    { x: 70, y: 60, color: 'text-red-500' },
    { x: 50, y: 80, color: 'text-purple-500' },
  ];

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Bonds */}
        {atoms.map((atom, i) => 
          atoms.slice(i + 1).map((otherAtom, j) => (
            <motion.line
              key={`${i}-${j}`}
              x1={atom.x}
              y1={atom.y}
              x2={otherAtom.x}
              y2={otherAtom.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-400"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.6, 0] }}
              transition={{
                duration: 2,
                delay: (i + j) * 0.2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))
        )}
        
        {/* Atoms */}
        {atoms.map((atom, i) => (
          <motion.circle
            key={i}
            cx={atom.x}
            cy={atom.y}
            r="6"
            fill="currentColor"
            className={atom.color}
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 360]
            }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Orbital rings */}
        <motion.circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="5,5"
          className="text-indigo-300"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
};

// Questionnaire Form Loader
export const FormLoader: React.FC<{ size?: number; className?: string }> = ({ 
  size = 80, 
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Form outline */}
        <rect
          x="20"
          y="15"
          width="60"
          height="70"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-400"
        />
        
        {/* Form lines */}
        {[...Array(5)].map((_, i) => (
          <motion.rect
            key={i}
            x="25"
            y={25 + i * 10}
            width="50"
            height="2"
            rx="1"
            fill="currentColor"
            className="text-indigo-400"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 1, 0] }}
            transition={{
              duration: 1.5,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
        
        {/* Checkboxes */}
        {[...Array(3)].map((_, i) => (
          <motion.rect
            key={`checkbox-${i}`}
            x="25"
            y={30 + i * 15}
            width="6"
            height="6"
            rx="1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-green-500"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1, 0] }}
            transition={{
              duration: 1,
              delay: 1 + i * 0.3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
        
        {/* Checkmarks */}
        {[...Array(3)].map((_, i) => (
          <motion.path
            key={`check-${i}`}
            d={`M${26 + i * 0.5} ${33 + i * 15} L${28} ${35 + i * 15} L${30 - i * 0.5} ${31 + i * 15}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-500"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{
              duration: 0.8,
              delay: 1.5 + i * 0.3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// Data Analysis Loader
export const AnalyticsLoader: React.FC<{ size?: number; className?: string }> = ({ 
  size = 80, 
  className = '' 
}) => {
  const bars = [20, 35, 50, 30, 45, 25, 40];
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Chart bars */}
        {bars.map((height, i) => (
          <motion.rect
            key={i}
            x={15 + i * 10}
            y={80 - height}
            width="6"
            height={height}
            rx="1"
            fill="currentColor"
            className={`${
              i % 3 === 0 ? 'text-blue-500' : 
              i % 3 === 1 ? 'text-green-500' : 'text-purple-500'
            }`}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 0.7, 1] }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
        
        {/* Trend line */}
        <motion.path
          d="M15 65 Q30 45 45 55 Q60 35 75 40 Q85 30 95 25"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-indigo-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Data points */}
        {[15, 45, 75].map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={45 - i * 10}
            r="3"
            fill="currentColor"
            className="text-orange-500"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{
              duration: 1,
              delay: 1 + i * 0.3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// Composite Artistic Loader
export const ArtisticLoader: React.FC<{ 
  type?: 'brain' | 'dna' | 'heartbeat' | 'molecular' | 'form' | 'analytics';
  size?: number;
  className?: string;
}> = ({ type = 'brain', size = 60, className = '' }) => {
  const loaders = {
    brain: BrainLoader,
    dna: DNALoader,
    heartbeat: HeartbeatLoader,
    molecular: MolecularLoader,
    form: FormLoader,
    analytics: AnalyticsLoader,
  };

  const LoaderComponent = loaders[type];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LoaderComponent size={size} />
    </div>
  );
};
