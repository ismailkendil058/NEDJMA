import { PatientStatus, STATUS_COLORS, STATUS_LABELS } from '@/types/patient';
import { cn } from '@/lib/utils';

interface StatusFilterProps {
  value: PatientStatus | 'all';
  onChange: (status: PatientStatus | 'all') => void;
  counts?: Record<PatientStatus | 'all', number>;
}

const ALL_STATUSES: (PatientStatus | 'all')[] = [
  'all',
  PatientStatus.NEW,
  PatientStatus.IN_TREATMENT,
  PatientStatus.COMPLETED,
  PatientStatus.CANCELLED,
  PatientStatus.NO_SHOW,
];

export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_STATUSES.map((status) => {
        const isActive = value === status;
        const isAll = status === 'all';
        const colors = isAll ? null : STATUS_COLORS[status];
        const label = isAll ? 'Tous' : STATUS_LABELS[status];
        const count = counts?.[status];
        
        return (
          <button
            key={status}
            onClick={() => onChange(status)}
            className={cn(
              'px-3 py-1.5 text-sm border transition-all duration-200 flex items-center gap-2',
              isActive
                ? isAll
                  ? 'border-accent bg-accent/10 text-accent'
                  : `${colors?.bg} ${colors?.text} border-current`
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
            )}
          >
            {!isAll && (
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  isActive ? colors?.dot : 'bg-current opacity-40'
                )}
              />
            )}
            {label}
            {count !== undefined && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                isActive 
                  ? 'bg-current/20' 
                  : 'bg-muted'
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Compact version for smaller spaces
interface StatusFilterCompactProps {
  value: PatientStatus | 'all';
  onChange: (status: PatientStatus | 'all') => void;
}

export function StatusFilterCompact({ value, onChange }: StatusFilterCompactProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as PatientStatus | 'all')}
      className="px-3 py-2 border border-border bg-background text-sm focus:outline-none focus:border-accent"
    >
      <option value="all">Tous les statuts</option>
      {Object.entries(STATUS_LABELS).map(([status, label]) => (
        <option key={status} value={status}>
          {label}
        </option>
      ))}
    </select>
  );
}
