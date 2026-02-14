import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard, DataCard } from '@/components/StatCard';
import { StatusBadge, PaymentBadge } from '@/components/StatusBadge';
import { StatusFilter } from '@/components/StatusFilter';
import { CreatePatientDialog } from '@/components/CreatePatientDialog';
import { AddPaymentDialog } from '@/components/AddPaymentDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useClinicStore } from '@/stores/clinicStore';
import { 
  PatientStatus, 
  getPaymentStatus, 
  calculateTotalPaid, 
  calculateRemaining 
} from '@/types/patient';
import { downloadCSV } from '@/lib/csvExport';
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  Search,
  UserPlus,
  Clock,
  Stethoscope,
  AlertCircle,
  Download
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const navItems = [
  { label: 'Tableau de bord', icon: LayoutDashboard, path: '/receptionist/dashboard' },
  { label: 'Patients', icon: Users, path: '/receptionist/patients' },
  { label: 'Calendrier', icon: Calendar, path: '/receptionist/calendar' },
  { label: 'Médecins', icon: Stethoscope, path: '/receptionist/doctors' },
];

export default function ReceptionistDashboard() {
  const { t } = useLanguage();
  const { patients, appointments, doctors } = useClinicStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');

  const activePatients = useMemo(() => patients.filter((p) => !p.isDeleted), [patients]);

  const filteredPatients = useMemo(() => {
    return activePatients
      .filter((p) => {
        const matchesSearch = 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.phone.includes(searchQuery);
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activePatients, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<PatientStatus | 'all', number> = {
      all: activePatients.length,
      [PatientStatus.NEW]: 0,
      [PatientStatus.IN_TREATMENT]: 0,
      [PatientStatus.COMPLETED]: 0,
      [PatientStatus.CANCELLED]: 0,
      [PatientStatus.NO_SHOW]: 0,
    };
    activePatients.forEach((p) => counts[p.status]++);
    return counts;
  }, [activePatients]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return appointments.filter((a) => {
      const aptDate = new Date(a.date);
      return aptDate > now && aptDate <= cutoff && !a.completed;
    });
  }, [appointments]);

  const patientsCreatedToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activePatients.filter((p) => new Date(p.createdAt) >= today).length;
  }, [activePatients]);

  const unpaidWithAppointment = useMemo(() => {
    return activePatients.filter((p) => {
      const remaining = calculateRemaining(p);
      return remaining > 0 && p.nextAppointmentId;
    });
  }, [activePatients]);

  const handleExportCSV = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPayments: { Patient: string; Médecin: string; Montant: string | number; Date: string }[] = [];
    activePatients.forEach((p) => {
      p.payments.forEach((pay) => {
        if (new Date(pay.date) >= today) {
          todayPayments.push({
            Patient: p.name,
            Médecin: p.doctorName,
            Montant: pay.amount,
            Date: format(new Date(pay.date), 'dd/MM/yyyy HH:mm'),
          });
        }
      });
    });
    if (todayPayments.length === 0) {
      todayPayments.push({ Patient: 'Aucun paiement', Médecin: '', Montant: '', Date: '' });
    }
    downloadCSV(todayPayments, `paiements-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  return (
    <DashboardLayout title={t('receptionist')} navItems={navItems}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl font-light mb-1 sm:mb-2">{t('dashboard')}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">{t('patient_management')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <CreatePatientDialog actorId="rec-1" actorName="Sarah Amrani" actorRole="receptionist" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard title="Total patients" value={activePatients.length} icon={Users} delay={0} />
          <StatCard title="Créés aujourd'hui" value={patientsCreatedToday} icon={UserPlus} delay={0.1} />
          <StatCard title="En traitement" value={statusCounts[PatientStatus.IN_TREATMENT]} icon={Clock} delay={0.2} />
          <StatCard title="RDV dans 24h" value={upcomingAppointments.length} icon={Calendar} delay={0.3} />
        </div>

        {unpaidWithAppointment.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 border border-amber-300 bg-amber-50"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">
                {unpaidWithAppointment.length} patient(s) avec solde impayé et RDV à venir
              </p>
              <p className="text-sm text-amber-700">
                {unpaidWithAppointment.map((p) => p.name).join(', ')}
              </p>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_patient')}
              className="pl-12 h-12 border-border"
            />
          </div>
          <StatusFilter value={statusFilter} onChange={setStatusFilter} counts={statusCounts} />
        </div>

        <DataCard title={`Liste des patients (${filteredPatients.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-muted-foreground font-medium">Patient</th>
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden sm:table-cell">Médecin</th>
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden md:table-cell">Soin</th>
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-muted-foreground font-medium">Paiement</th>
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-muted-foreground font-medium">Statut</th>
                  <th className="text-left py-3 px-4 text-xs tracking-widest uppercase text-muted-foreground font-medium hidden lg:table-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => {
                  const paymentStatus = getPaymentStatus(patient);
                  const paid = calculateTotalPaid(patient);
                  const remaining = calculateRemaining(patient);
                  
                  return (
                    <motion.tr
                      key={patient.id}
                      whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
                      className="border-b border-border cursor-pointer"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm hidden sm:table-cell">{patient.doctorName}</td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div>
                          <p className="text-sm">{patient.careType || '—'}</p>
                          {patient.careTotal > 0 && (
                            <p className="text-xs text-muted-foreground">{patient.careTotal.toLocaleString()} DA</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <PaymentBadge status={paymentStatus} size="sm" />
                          {patient.careTotal > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {paid.toLocaleString()} / {patient.careTotal.toLocaleString()} DA
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={patient.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell">
                        {remaining > 0 && patient.careTotal > 0 && (
                          <AddPaymentDialog
                            patientId={patient.id}
                            patientName={patient.name}
                            remaining={remaining}
                            actorId="rec-1"
                            actorName="Sarah Amrani"
                            actorRole="receptionist"
                          />
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {filteredPatients.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">Aucun patient trouvé</div>
            )}
          </div>
        </DataCard>

        {upcomingAppointments.length > 0 && (
          <DataCard title="Rendez-vous dans les prochaines 24h">
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => {
                const patient = activePatients.find((p) => p.id === apt.patientId);
                const doctor = doctors.find((d) => d.id === apt.doctorId);
                return (
                  <div key={apt.id} className="flex items-center justify-between p-4 border border-accent/30 bg-accent/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-accent/10">
                        <Clock className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{patient?.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-lg">{format(new Date(apt.date), 'HH:mm')}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(apt.date), 'dd MMMM', { locale: fr })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </DataCard>
        )}
      </div>
    </DashboardLayout>
  );
}
