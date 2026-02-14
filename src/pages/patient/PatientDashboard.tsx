import { useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard, DataCard } from '@/components/StatCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useClinicStore } from '@/stores/clinicStore';
import { calculateTotalPaid, calculateRemaining } from '@/types/patient';
import { 
  LayoutDashboard, 
  Calendar,
  Phone,
  DollarSign,
  Receipt,
  CheckCircle2,
  MessageCircle,
  Download,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const navItems = [
  { label: 'Mon compte', icon: LayoutDashboard, path: '/patient/dashboard' },
  { label: 'Mes rendez-vous', icon: Calendar, path: '/patient/appointments' },
];

export default function PatientDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { patients, appointments } = useClinicStore();

  // Find the logged-in patient (demo: pat-1)
  const patientId = 'pat-1';
  const patient = patients.find((p) => p.id === patientId);

  const patientAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments]);

  const upcomingApt = patientAppointments.find((a) => new Date(a.date) > new Date() && !a.completed);
  const pastApts = patientAppointments.filter((a) => new Date(a.date) <= new Date() || a.completed);

  if (!patient) {
    return (
      <DashboardLayout title={t('patient')} navItems={navItems}>
        <div className="text-center py-12 text-muted-foreground">Patient introuvable</div>
      </DashboardLayout>
    );
  }

  const totalPaid = calculateTotalPaid(patient);
  const remaining = calculateRemaining(patient);
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const handleWhatsApp = () => {
    window.open(`https://wa.me/213550123456?text=${encodeURIComponent('Bonjour, je suis patient à la Clinique Nedjma.')}`, '_blank');
  };

  const handleDownloadSummary = () => {
    const summary = [
      `RÉSUMÉ - ${patient.name}`,
      `Téléphone: ${patient.phone}`,
      `Médecin: ${patient.doctorName}`,
      `Soin: ${patient.careType || 'Non assigné'}`,
      `Total: ${patient.careTotal.toLocaleString()} DA`,
      `Payé: ${totalPaid.toLocaleString()} DA`,
      `Reste: ${remaining.toLocaleString()} DA`,
      '',
      'RENDEZ-VOUS:',
      ...patientAppointments.map((a) =>
        `${format(new Date(a.date), 'dd/MM/yyyy HH:mm')} — ${a.careType} (${a.completed ? 'Terminé' : 'À venir'})`
      ),
      '',
      'PAIEMENTS:',
      ...patient.payments.map((p, i) =>
        `Tranche ${i + 1}: ${p.amount.toLocaleString()} DA — ${format(new Date(p.date), 'dd/MM/yyyy')}`
      ),
    ].join('\n');

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `resume-${patient.name.replace(/\s+/g, '-')}.txt`;
    link.click();
  };

  return (
    <DashboardLayout title={t('patient')} navItems={navItems}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl font-light mb-2">Bonjour, {user?.name || patient.name}</h1>
            <p className="text-muted-foreground">{t('my_account')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleWhatsApp}>
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleDownloadSummary}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Résumé</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <StatCard title={t('total_care')} value={patient.careTotal.toLocaleString()} suffix="DA" icon={Receipt} delay={0} />
          <StatCard title={t('remaining')} value={remaining.toLocaleString()} suffix="DA" icon={DollarSign} delay={0.1} />
          <StatCard title={t('installments_paid')} value={patient.payments.length} icon={CheckCircle2} delay={0.2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Next Appointment */}
          <DataCard title={t('next_appointment')}>
            {upcomingApt ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border-2 border-accent">
                  <Calendar className="w-10 h-10 text-accent" strokeWidth={1} />
                </div>
                <p className="font-serif text-3xl mb-2">
                  {format(new Date(upcomingApt.date), 'dd MMMM yyyy', { locale: fr })}
                </p>
                <p className="text-2xl text-accent font-serif">
                  {format(new Date(upcomingApt.date), 'HH:mm')}
                </p>
                <p className="text-sm text-muted-foreground mt-2">{upcomingApt.careType}</p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">Aucun RDV à venir</div>
            )}
          </DataCard>

          {/* Mini Calendar */}
          <DataCard title={t('calendar')}>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                <div key={day} className="text-xs text-muted-foreground py-2">{day}</div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate();
                const isAppointment = upcomingApt &&
                  new Date(upcomingApt.date).getDate() === day &&
                  new Date(upcomingApt.date).getMonth() === today.getMonth();
                return (
                  <motion.div
                    key={day}
                    whileHover={{ scale: 1.1 }}
                    className={`py-2 text-sm cursor-default transition-colors ${
                      isAppointment ? 'bg-accent text-accent-foreground font-medium'
                      : isToday ? 'bg-foreground text-background font-medium'
                      : 'hover:bg-muted'
                    }`}
                  >
                    {day}
                  </motion.div>
                );
              })}
            </div>
          </DataCard>
        </div>

        {/* Appointment History Timeline */}
        <DataCard title="Historique des rendez-vous">
          <div className="space-y-0">
            {patientAppointments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Aucun rendez-vous</p>
            ) : (
              patientAppointments.map((apt, i) => (
                <div key={apt.id} className="flex gap-4 pb-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${apt.completed ? 'bg-green-500' : new Date(apt.date) > new Date() ? 'bg-accent' : 'bg-muted-foreground'}`} />
                    {i < patientAppointments.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-sm">{apt.careType}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(apt.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                    <span className={`text-xs mt-1 inline-block px-2 py-0.5 ${
                      apt.completed ? 'bg-green-50 text-green-700' : new Date(apt.date) > new Date() ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {apt.completed ? 'Terminé' : new Date(apt.date) > new Date() ? 'À venir' : 'Passé'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DataCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment History */}
          <DataCard title={t('installments_paid')}>
            <div className="space-y-4">
              {patient.payments.map((inst, i) => (
                <div key={inst.id} className="flex items-center justify-between p-4 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-accent/10">
                      <DollarSign className="w-5 h-5 text-accent" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-medium">Tranche {i + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(inst.date), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <p className="font-serif text-lg text-accent">{inst.amount.toLocaleString()} DA</p>
                </div>
              ))}
              {patient.payments.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">Aucun paiement enregistré</p>
              )}
            </div>
          </DataCard>

          {/* Clinic Rules */}
          <DataCard title="Règlement de la clinique">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 border border-border">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Politique d'absence (No-Show)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    En cas d'absence sans annulation préalable (24h avant), le rendez-vous sera compté comme "Absent". 
                    Après 3 absences, des frais supplémentaires peuvent s'appliquer.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border border-border">
                <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Horaires</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lundi - Samedi, 08h00 - 23h00. Veuillez arriver 10 minutes avant votre RDV.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border border-border">
                <DollarSign className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Paiement</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Le paiement intégral doit être effectué avant la fin du traitement. 
                    Les paiements en tranches sont acceptés.
                  </p>
                </div>
              </div>
            </div>
          </DataCard>
        </div>

        {/* Contact */}
        <DataCard title={t('emergency_contact')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-accent/10 flex-shrink-0">
                <Phone className="w-5 h-5 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Urgences 24/7</p>
                <p className="font-serif text-2xl">0550 123 456</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-muted flex-shrink-0">
                <Phone className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Accueil</p>
                <p className="font-serif text-2xl">0550 789 012</p>
              </div>
            </div>
          </div>
        </DataCard>
      </div>
    </DashboardLayout>
  );
}
