import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard, DataCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusFilter } from '@/components/StatusFilter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useClinicStore } from '@/stores/clinicStore';
import { downloadCSV } from '@/lib/csvExport';
import { 
  PatientStatus, 
  calculateTotalPaid,
  STATUS_LABELS
} from '@/types/patient';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  UserPlus,
  DollarSign,
  Calendar,
  AlertTriangle,
  ScrollText,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#3ACCC1', '#1a1a1a', '#888888', '#f59e0b', '#ef4444'];

const navItems = [
  { label: 'Tableau de bord', icon: LayoutDashboard, path: '/owner/dashboard' },
  { label: 'Médecins', icon: Stethoscope, path: '/owner/doctors' },
  { label: 'Réceptionnistes', icon: Users, path: '/owner/receptionists' },
  { label: 'Journal d\'audit', icon: ScrollText, path: '/owner/audit' },
];

export default function OwnerDashboard() {
  const { t } = useLanguage();
  const { patients, doctors, appointments } = useClinicStore();
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');

  const activePatients = useMemo(() => patients.filter((p) => !p.isDeleted), [patients]);

  const totalRevenue = useMemo(() => activePatients.reduce((sum, p) => sum + calculateTotalPaid(p), 0), [activePatients]);

  const revenueByDoctor = useMemo(() => {
    const map: Record<string, number> = {};
    activePatients.forEach((p) => {
      map[p.doctorName] = (map[p.doctorName] || 0) + calculateTotalPaid(p);
    });
    return Object.entries(map).map(([name, revenue]) => ({ name, revenue }));
  }, [activePatients]);

  const patientsByDoctor = useMemo(() => {
    const map: Record<string, number> = {};
    activePatients.forEach((p) => { map[p.doctorName] = (map[p.doctorName] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [activePatients]);

  const statusDistribution = useMemo(() => {
    const counts: Record<PatientStatus, number> = {
      [PatientStatus.NEW]: 0, [PatientStatus.IN_TREATMENT]: 0,
      [PatientStatus.COMPLETED]: 0, [PatientStatus.CANCELLED]: 0, [PatientStatus.NO_SHOW]: 0,
    };
    activePatients.forEach((p) => counts[p.status]++);
    return Object.entries(counts).map(([status, value]) => ({
      name: STATUS_LABELS[status as PatientStatus], value, status: status as PatientStatus,
    }));
  }, [activePatients]);

  const statusCounts = useMemo(() => {
    const counts: Record<PatientStatus | 'all', number> = {
      all: activePatients.length, [PatientStatus.NEW]: 0, [PatientStatus.IN_TREATMENT]: 0,
      [PatientStatus.COMPLETED]: 0, [PatientStatus.CANCELLED]: 0, [PatientStatus.NO_SHOW]: 0,
    };
    activePatients.forEach((p) => counts[p.status]++);
    return counts;
  }, [activePatients]);

  const noShowStats = useMemo(() => {
    const noShows = activePatients.filter((p) => p.status === PatientStatus.NO_SHOW);
    const estimatedLoss = noShows.reduce((sum, p) => sum + p.careTotal, 0);
    const rate = activePatients.length > 0 ? (noShows.length / activePatients.length) * 100 : 0;
    return { count: noShows.length, estimatedLoss, rate };
  }, [activePatients]);

  const filteredPatients = useMemo(() => {
    return activePatients
      .filter((p) => statusFilter === 'all' || p.status === statusFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activePatients, statusFilter]);

  const currentMonthAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter((a) => {
      const d = new Date(a.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [appointments]);

  // Best performing doctor
  const bestDoctor = useMemo(() => {
    if (revenueByDoctor.length === 0) return null;
    return revenueByDoctor.reduce((best, d) => d.revenue > best.revenue ? d : best, revenueByDoctor[0]);
  }, [revenueByDoctor]);

  // Average revenue per patient
  const avgRevenue = useMemo(() => {
    const paying = activePatients.filter((p) => p.careTotal > 0);
    if (paying.length === 0) return 0;
    return Math.round(paying.reduce((s, p) => s + calculateTotalPaid(p), 0) / paying.length);
  }, [activePatients]);

  return (
    <DashboardLayout title={t('owner')} navItems={navItems}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl font-light mb-2">{t('dashboard')}</h1>
            <p className="text-muted-foreground">{t('statistics')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard title={t('total_revenue')} value={totalRevenue.toLocaleString()} suffix="DA" icon={DollarSign} trend={{ value: 12, isPositive: true }} delay={0} />
          <StatCard title={t('total_patients')} value={activePatients.length} icon={Users} trend={{ value: 8, isPositive: true }} delay={0.1} />
          <StatCard title="Médecins actifs" value={doctors.length} icon={Stethoscope} delay={0.2} />
          <StatCard title="RDV ce mois" value={currentMonthAppointments} icon={Calendar} trend={{ value: 5, isPositive: true }} delay={0.3} />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          {bestDoctor && (
            <DataCard title="Meilleur médecin">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-accent/10">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-medium">{bestDoctor.name}</p>
                  <p className="text-sm text-muted-foreground">{bestDoctor.revenue.toLocaleString()} DA</p>
                </div>
              </div>
            </DataCard>
          )}
          <DataCard title="Revenu moyen / patient">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-accent/10">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <p className="font-serif text-2xl">{avgRevenue.toLocaleString()} DA</p>
            </div>
          </DataCard>
          <DataCard title="Patients / médecin">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-accent/10">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <p className="font-serif text-2xl">{doctors.length > 0 ? Math.round(activePatients.length / doctors.length) : 0}</p>
            </div>
          </DataCard>
        </div>

        {/* No-Show Warning */}
        {noShowStats.count > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-4 border border-red-200 bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-800">
                {noShowStats.count} patient(s) absent(s) — Perte estimée: {noShowStats.estimatedLoss.toLocaleString()} DA
              </p>
              <p className="text-sm text-red-700">Taux d'absence: {noShowStats.rate.toFixed(1)}%</p>
            </div>
          </motion.div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DataCard title={t('revenue_by_doctor')}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByDoctor}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString()} DA`, 'Revenu']} contentStyle={{ border: '1px solid #e5e5e5', borderRadius: 0 }} />
                  <Bar dataKey="revenue" fill="#3ACCC1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DataCard>

          <DataCard title="Distribution des statuts">
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDistribution.filter((s) => s.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                    {statusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'Patients']} contentStyle={{ border: '1px solid #e5e5e5', borderRadius: 0 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {statusDistribution.filter((s) => s.value > 0).map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-muted-foreground">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </DataCard>
        </div>

        {/* Patient Table */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl">Aperçu des patients</h2>
          <StatusFilter value={statusFilter} onChange={setStatusFilter} counts={statusCounts} />
        </div>

        <DataCard title={`Patients (${filteredPatients.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-muted-foreground font-medium">Patient</th>
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden sm:table-cell">Médecin</th>
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-muted-foreground font-medium">Revenu</th>
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-muted-foreground font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.slice(0, 10).map((patient) => (
                  <tr key={patient.id} className="border-b border-border">
                    <td className="py-3 px-4">
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-sm hidden sm:table-cell">{patient.doctorName}</td>
                    <td className="py-3 px-4 font-serif">{calculateTotalPaid(patient).toLocaleString()} DA</td>
                    <td className="py-3 px-4"><StatusBadge status={patient.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <motion.button whileHover={{ y: -2 }} onClick={() => {}} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border border-border hover:border-accent/50 transition-colors">
            <div className="w-12 h-12 flex items-center justify-center bg-accent/10">
              <UserPlus className="w-6 h-6 text-accent" />
            </div>
            <div className="text-left">
              <p className="font-serif text-lg">{t('create_doctor')}</p>
              <p className="text-sm text-muted-foreground">Ajouter un nouveau médecin</p>
            </div>
          </motion.button>

          <motion.button whileHover={{ y: -2 }} onClick={() => {}} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border border-border hover:border-accent/50 transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-accent/10 flex-shrink-0">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <div className="text-left">
              <p className="font-serif text-base sm:text-lg">{t('create_receptionist')}</p>
              <p className="text-sm text-muted-foreground">Ajouter un nouveau réceptionniste</p>
            </div>
          </motion.button>
        </div>
      </div>
    </DashboardLayout>
  );
}
