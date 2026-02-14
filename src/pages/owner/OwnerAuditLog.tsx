import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataCard } from '@/components/StatCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useClinicStore } from '@/stores/clinicStore';
import { AuditActionType, AUDIT_ACTION_LABELS, AUDIT_ACTION_COLORS } from '@/types/auditLog';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Users,
  ScrollText,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Tableau de bord', icon: LayoutDashboard, path: '/owner/dashboard' },
  { label: 'Médecins', icon: Stethoscope, path: '/owner/doctors' },
  { label: 'Réceptionnistes', icon: Users, path: '/owner/receptionists' },
  { label: 'Journal d\'audit', icon: ScrollText, path: '/owner/audit' },
];

export default function OwnerAuditLog() {
  const { t } = useLanguage();
  const { auditLogs } = useClinicStore();

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        search === '' ||
        log.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        log.actorName.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase());
      const matchesAction = actionFilter === 'all' || log.actionType === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [auditLogs, search, actionFilter]);

  return (
    <DashboardLayout title={t('owner')} navItems={navItems}>
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-light mb-2">Journal d'audit</h1>
          <p className="text-muted-foreground">Historique complet des actions — lecture seule</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par patient, acteur..."
              className="pl-12 h-12"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-56 h-12">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrer par action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              {Object.entries(AUDIT_ACTION_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Log entries */}
        <DataCard title={`${filteredLogs.length} entrée(s)`}>
          <div className="divide-y divide-border">
            {filteredLogs.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">Aucune entrée trouvée</p>
            ) : (
              filteredLogs.slice(0, 50).map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="py-4 px-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                >
                  <div className="flex-shrink-0 w-36 text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 bg-muted inline-block w-fit ${AUDIT_ACTION_COLORS[log.actionType]}`}>
                    {AUDIT_ACTION_LABELS[log.actionType]}
                  </span>
                  <div className="flex-1 text-sm">
                    <span className="font-medium">{log.actorName}</span>
                    <span className="text-muted-foreground mx-1">—</span>
                    <span>{log.details}</span>
                  </div>
                  {log.patientName && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 w-fit">
                      {log.patientName}
                    </span>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </DataCard>
      </div>
    </DashboardLayout>
  );
}
