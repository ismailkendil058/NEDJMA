import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  suffix?: string;
  trend?: { value: number; isPositive: boolean };
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, suffix, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-card border border-border p-4 sm:p-6 hover:border-accent/30 transition-colors duration-300"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-border">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" strokeWidth={1.5} />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground mb-1 sm:mb-2 truncate">
        {title}
      </p>
      <p className="font-serif text-xl sm:text-3xl font-light">
        {value}
        {suffix && <span className="text-lg text-muted-foreground ml-1">{suffix}</span>}
      </p>
    </motion.div>
  );
}

interface DataCardProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function DataCard({ title, children, action, className = '' }: DataCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-card border border-border ${className}`}
    >
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h3 className="font-serif text-xl font-light">{title}</h3>
        {action}
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}
