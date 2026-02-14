import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl md:text-6xl',
  };

  return (
    <motion.div 
      className={`font-serif font-light tracking-[0.2em] ${sizeClasses[size]} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <span className="text-foreground">NEDJ</span>
      <span className="text-accent">M</span>
      <span className="text-foreground">A</span>
    </motion.div>
  );
}
