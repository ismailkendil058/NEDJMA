import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard, DataCard } from '@/components/StatCard';
import { StatusBadge, PaymentBadge } from '@/components/StatusBadge';
import { StatusFilterCompact } from '@/components/StatusFilter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useClinicStore } from '@/stores/clinicStore';
import { 
  PatientStatus, 
  getPaymentStatus, 
  calculateRemaining,
  CARE_TYPES,
  CARE_DURATIONS
} from '@/types/patient';
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const navItems = [
  { label: 'Tableau de bord', icon: LayoutDashboard, path: '/doctor/dashboard' },
  { label: 'Mes patients', icon: Users, path: '/doctor/patients' },
  { label: 'Mon emploi du temps', icon: Calendar, path: '/doctor/schedule' },
];

export default function DoctorDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { patients, appointments, setCareType, markCompleted, updateMedicalNotes } = useClinicStore();
  
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [assignCareOpen, setAssignCareOpen] = useState<string | null>(null);
  const [selectedCare, setSelectedCare] = useState('');
  const [careTotal, setCareTotal] = useState('');

  const doctorId = 'dr-1';
  const doctorName = user?.name || 'Dr. Ahmed Benali';
  
  const allMyPatients = useMemo(() => {
    return patients.filter((p) => p.doctorId === doctorId && !p.isDeleted);
  }, [patients]);

  const myPatients = useMemo(() => {
    return allMyPatients
      .filter((p) => statusFilter === 'all' || p.status === statusFilter)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [allMyPatients, statusFilter]);

  const myAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.doctorId === doctorId && !a.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

  const todayAppointments = useMemo(() => {
    return myAppointments.filter((a) => isToday(new Date(a.date)));
  }, [myAppointments]);

  const completedCount = allMyPatients.filter((p) => p.status === PatientStatus.COMPLETED).length;
  const inTreatmentCount = allMyPatients.filter((p) => p.status === PatientStatus.IN_TREATMENT).length;
  const newCount = allMyPatients.filter((p) => p.status === PatientStatus.NEW).length;

  const handleAssignCare = () => {
    if (!assignCareOpen || !selectedCare || !careTotal) return;
    const total = Number(careTotal);
    if (isNaN(total) || total <= 0) {
      toast.error('Montant invalide');
      return;
    }
    setCareType(assignCareOpen, selectedCare as any, total, doctorId, doctorName);
    toast.success(`Soin "${selectedCare}" assigné — ${total.toLocaleString()} DA`);
    setAssignCareOpen(null);
    setSelectedCare('');
    setCareTotal('');
  };

  const handleMarkCompleted = (patientId: string) => {
    const result = markCompleted(patientId, doctorId, doctorName, 'doctor');
    if (!result.success) {
      toast.error(result.reason || 'Impossible de terminer ce soin');
    } else {
      toast.success('Soin marqué comme terminé');
    }
  };

  const handleSaveNotes = (patientId: string) => {
    updateMedicalNotes(patientId, notesText);
    toast.success('Notes médicales sauvegardées');
    setEditingNotes(null);
  };

  return (
    <DashboardLayout title={t('doctor')} navItems={navItems}>
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-light mb-2">{t('dashboard')}</h1>
          <p className="text-muted-foreground">Bienvenue, {doctorName}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          <StatCard title={t('my_patients')} value={allMyPatients.length} icon={Users} delay={0} />
          <StatCard title="Nouveaux" value={newCount} icon={AlertTriangle} delay={0.1} />
          <StatCard title="En traitement" value={inTreatmentCount} icon={Clock} delay={0.2} />
          <StatCard title={t('completed')} value={completedCount} icon={CheckCircle2} delay={0.3} />
        </div>

        {/* Today's Agenda */}
        {todayAppointments.length > 0 && (
          <DataCard title={`Agenda d'aujourd'hui (${todayAppointments.length})`} className="border-accent/30">
            <div className="space-y-3">
              {todayAppointments.map((apt) => {
                const patient = patients.find((p) => p.id === apt.patientId);
                return (
                  <motion.div key={apt.id} whileHover={{ x: 4 }} className="flex items-center gap-4 p-4 border border-border bg-accent/5">
                    <div className="w-16 text-center border-r border-border pr-4">
                      <p className="font-serif text-xl">{format(new Date(apt.date), 'HH:mm')}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{patient?.name}</p>
                      <p className="text-sm text-muted-foreground">{apt.careType}</p>
                    </div>
                    {patient && <StatusBadge status={patient.status} size="sm" />}
                  </motion.div>
                );
              })}
            </div>
          </DataCard>
        )}

        {/* Patients List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">{t('my_patients')}</h2>
            <StatusFilterCompact value={statusFilter} onChange={setStatusFilter} />
          </div>
          
          <DataCard title="">
            <div className="divide-y divide-border">
              {myPatients.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">Aucun patient trouvé</div>
              ) : (
                myPatients.map((patient) => {
                  const paymentStatus = getPaymentStatus(patient);
                  const remaining = calculateRemaining(patient);
                  const isEditingThis = editingNotes === patient.id;
                  
                  return (
                    <div key={patient.id} className="py-4 px-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <StatusBadge status={patient.status} size="sm" showDot />
                          <div>
                            <p className="font-medium text-sm sm:text-base">{patient.name}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {patient.careType || 'Aucun soin sélectionné'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 ml-8 sm:ml-0 flex-wrap">
                          {patient.careTotal > 0 && (
                            <div className="text-right">
                              <p className="font-serif text-lg">{patient.careTotal.toLocaleString()} DA</p>
                              {remaining > 0 && (
                                <p className="text-xs text-amber-600">Reste: {remaining.toLocaleString()} DA</p>
                              )}
                            </div>
                          )}
                          <PaymentBadge status={paymentStatus} size="sm" />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 ml-8 sm:ml-12 mt-2">
                        {/* Assign care (soin template quick select) */}
                        {!patient.careTotalLocked && (
                          <Dialog open={assignCareOpen === patient.id} onOpenChange={(o) => setAssignCareOpen(o ? patient.id : null)}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-xs gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Assigner soin
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm">
                              <DialogHeader>
                                <DialogTitle className="font-serif">Assigner un soin</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Select value={selectedCare} onValueChange={(v) => {
                                  setSelectedCare(v);
                                  // Auto-suggest total based on care type
                                  const suggestedPrices: Record<string, number> = {
                                    'Consultation': 3000, 'Détartrage': 5000, 'Blanchiment': 25000,
                                    'Extraction': 8000, 'Implant dentaire': 80000, 'Couronne': 30000,
                                    'Bridge': 50000, 'Orthodontie': 120000, 'Traitement de canal': 15000,
                                  };
                                  setCareTotal(String(suggestedPrices[v] || ''));
                                }}>
                                  <SelectTrigger><SelectValue placeholder="Sélectionner le soin" /></SelectTrigger>
                                  <SelectContent>
                                    {CARE_TYPES.map((ct) => (
                                      <SelectItem key={ct} value={ct}>
                                        {ct} ({CARE_DURATIONS[ct]} min)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  value={careTotal}
                                  onChange={(e) => setCareTotal(e.target.value)}
                                  placeholder="Montant total (DA)"
                                />
                                <Button onClick={handleAssignCare} className="w-full bg-foreground text-background">
                                  Confirmer
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Mark completed */}
                        {patient.status === PatientStatus.IN_TREATMENT && (
                          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleMarkCompleted(patient.id)}>
                            <CheckCircle2 className="w-3 h-3" />
                            Terminer
                          </Button>
                        )}

                        {/* Medical notes */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => {
                            if (isEditingThis) {
                              setEditingNotes(null);
                            } else {
                              setEditingNotes(patient.id);
                              setNotesText(patient.medicalNotes || '');
                            }
                          }}
                        >
                          <FileText className="w-3 h-3" />
                          Notes
                        </Button>
                      </div>

                      {/* Notes editor (inline) */}
                      {isEditingThis && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="ml-8 sm:ml-12 mt-3"
                        >
                          <Textarea
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="Notes médicales privées (visibles uniquement par le médecin)..."
                            className="min-h-[80px] text-sm"
                            maxLength={2000}
                          />
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" onClick={() => handleSaveNotes(patient.id)} className="gap-1 bg-foreground text-background">
                              <Save className="w-3 h-3" />
                              Sauvegarder
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingNotes(null)} className="gap-1">
                              <X className="w-3 h-3" />
                              Annuler
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </DataCard>
        </div>

        {/* Upcoming Schedule */}
        <DataCard title={t('my_schedule')}>
          <div className="space-y-4">
            {myAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucun rendez-vous à venir</div>
            ) : (
              myAppointments.slice(0, 5).map((apt) => {
                const patient = patients.find((p) => p.id === apt.patientId);
                const isAppointmentToday = isToday(new Date(apt.date));
                return (
                  <div
                    key={apt.id}
                    className={`flex items-center gap-4 p-4 border ${isAppointmentToday ? 'border-accent bg-accent/5' : 'border-border'}`}
                  >
                    <div className="w-20 text-center">
                      <p className="font-serif text-lg">{format(new Date(apt.date), 'HH:mm')}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(apt.date), 'dd MMM', { locale: fr })}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{patient?.name}</p>
                      <p className="text-sm text-muted-foreground">{apt.careType}</p>
                    </div>
                    {isAppointmentToday && (
                      <span className="text-xs px-2 py-1 bg-accent text-accent-foreground">Aujourd'hui</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DataCard>
      </div>
    </DashboardLayout>
  );
}
