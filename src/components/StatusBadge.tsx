import { motion } from 'framer-motion';
import {
  PatientStatus,
  PaymentStatus,
  STATUS_COLORS,
  STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from '@/types/patient';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: PatientStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, size = 'md', showDot = true, className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        colors.bg,
        colors.text,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
        className
      )}
    >
      {showDot && (
        <span className={cn('rounded-full', colors.dot, size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5')} />
      )}
      {label}
    </motion.span>
  );
}

interface PaymentBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function PaymentBadge({ status, size = 'md', className }: PaymentBadgeProps) {
  const colors = PAYMENT_STATUS_COLORS[status];
  const label = PAYMENT_STATUS_LABELS[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        colors.bg,
        colors.text,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
        className
      )}
    >
      {label}
    </span>
  );
}
