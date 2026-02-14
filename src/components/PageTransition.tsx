import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ 
  children, 
  delay = 0,
  className = '' 
}: { 
  children: ReactNode; 
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({ 
  children, 
  direction = 'right',
  delay = 0,
  className = '' 
}: { 
  children: ReactNode; 
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
}) {
  const directionMap = {
    left: { x: -30, y: 0 },
    right: { x: 30, y: 0 },
    up: { x: 0, y: -30 },
    down: { x: 0, y: 30 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ 
  children,
  className = '',
  staggerDelay = 0.1
}: { 
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      className={className}
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ 
  children,
  className = ''
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }
        },
      }}
    >
      {children}
    </motion.div>
  );
}
