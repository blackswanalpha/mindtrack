'use client';

import React from 'react';
import { motion, HTMLMotionProps, SVGMotionProps } from 'framer-motion';
import { useClientSide } from '@/hooks/use-client-side';

// Client-safe motion components that prevent hydration mismatches

interface ClientSafeMotionProps extends HTMLMotionProps<'div'> {
  fallback?: React.ReactNode;
}

export const ClientSafeMotion: React.FC<ClientSafeMotionProps> = ({
  children,
  fallback,
  ...props
}) => {
  const isClient = useClientSide();

  if (!isClient) {
    return (
      <div className={props.className} style={props.style}>
        {fallback || children}
      </div>
    );
  }

  return <motion.div {...props}>{children}</motion.div>;
};

// Specific client-safe motion components
export const ClientSafeMotionDiv: React.FC<HTMLMotionProps<'div'>> = (props) => {
  const isClient = useClientSide();
  
  if (!isClient) {
    return <div className={props.className} style={props.style}>{props.children}</div>;
  }
  
  return <motion.div {...props} />;
};

export const ClientSafeMotionSpan: React.FC<HTMLMotionProps<'span'>> = (props) => {
  const isClient = useClientSide();
  
  if (!isClient) {
    return <span className={props.className} style={props.style}>{props.children}</span>;
  }
  
  return <motion.span {...props} />;
};

export const ClientSafeMotionButton: React.FC<HTMLMotionProps<'button'>> = (props) => {
  const isClient = useClientSide();
  
  if (!isClient) {
    return <button className={props.className} style={props.style}>{props.children}</button>;
  }
  
  return <motion.button {...props} />;
};

export const ClientSafeMotionImg: React.FC<HTMLMotionProps<'img'>> = (props) => {
  const isClient = useClientSide();
  
  if (!isClient) {
    return <img className={props.className} style={props.style} src={props.src} alt={props.alt} />;
  }
  
  return <motion.img {...props} />;
};

export const ClientSafeMotionSVG: React.FC<SVGMotionProps<SVGSVGElement>> = (props) => {
  const isClient = useClientSide();
  
  if (!isClient) {
    return <svg className={props.className} style={props.style}>{props.children}</svg>;
  }
  
  return <motion.svg {...props} />;
};

export const ClientSafeMotionPath: React.FC<SVGMotionProps<SVGPathElement>> = (props) => {
  const isClient = useClientSide();
  
  if (!isClient) {
    return <path className={props.className} style={props.style} d={props.d} />;
  }
  
  return <motion.path {...props} />;
};

export const ClientSafeMotionCircle: React.FC<SVGMotionProps<SVGCircleElement>> = (props) => {
  const isClient = useClientSide();
  
  if (!isClient) {
    return <circle className={props.className} style={props.style} cx={props.cx} cy={props.cy} r={props.r} />;
  }
  
  return <motion.circle {...props} />;
};

export const ClientSafeMotionRect: React.FC<SVGMotionProps<SVGRectElement>> = (props) => {
  const isClient = useClientSide();
  
  if (!isClient) {
    return <rect className={props.className} style={props.style} x={props.x} y={props.y} width={props.width} height={props.height} />;
  }
  
  return <motion.rect {...props} />;
};

export const ClientSafeMotionLine: React.FC<SVGMotionProps<SVGLineElement>> = (props) => {
  const isClient = useClientSide();
  
  if (!isClient) {
    return <line className={props.className} style={props.style} x1={props.x1} y1={props.y1} x2={props.x2} y2={props.y2} />;
  }
  
  return <motion.line {...props} />;
};

// Higher-order component for making any component client-safe
export const withClientSafeMotion = <P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<P>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const isClient = useClientSide();
    
    if (!isClient && fallbackComponent) {
      const FallbackComponent = fallbackComponent;
      return <FallbackComponent {...props} ref={ref} />;
    }
    
    if (!isClient) {
      return null;
    }
    
    return <Component {...props} ref={ref} />;
  });
};

// Utility for conditional animation props
export const useClientSafeAnimationProps = <T extends object>(
  animationProps: T,
  fallbackProps?: Partial<T>
): T | Partial<T> => {
  const isClient = useClientSide();
  
  if (!isClient) {
    return fallbackProps || {};
  }
  
  return animationProps;
};
