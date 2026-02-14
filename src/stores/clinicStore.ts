import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Patient,
  Doctor,
  Receptionist,
  Appointment,
  PatientStatus,
  AppointmentConfirmation,
  CareType,
  Payment,
  StatusHistoryEntry,
  calculateRemaining,
} from '@/types/patient';
import {
  AuditLogEntry,
  AuditActionType,
  ActorRole,
} from '@/types/auditLog';
import {
  checkSchedulingConflict,
  ConflictCheckResult,
} from '@/lib/scheduling';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ─── Demo Data ──────────────────────────────────────────────

function createDemoPatients(): Patient[] {
  return [
    {
      id: 'pat-1',
      name: 'Mohamed Kadi',
      phone: '0555678901',
      doctorId: 'dr-1',
      doctorName: 'Dr. Ahmed Benali',
      status: PatientStatus.IN_TREATMENT,
      statusHistory: [{
        id: 'sh-1',
        previousStatus: PatientStatus.NEW,
        newStatus: PatientStatus.IN_TREATMENT,
        changedAt: new Date(2025, 0, 16),
        changedBy: 'dr-1',
      }],
      careType: 'Implant dentaire',
      careTotal: 80000,
      careTotalLocked: true,
      payments: [
        { id: 'pay-1', amount: 20000, date: new Date(2025, 0, 15), recordedBy: 'rec-1' },
        { id: 'pay-2', amount: 20000, date: new Date(2025, 1, 1), recordedBy: 'rec-1' },
      ],
      createdAt: new Date(2025, 0, 15),
      updatedAt: new Date(2025, 1, 1),
      nextAppointmentId: 'apt-1',
      notificationConsent: true,
      isDeleted: false,
      medicalNotes: 'Patient avec antécédents de diabète. Suivi régulier recommandé.',
    },
    {
      id: 'pat-2',
      name: 'Yasmine Belkacem',
      phone: '0556789012',
      doctorId: 'dr-2',
      doctorName: 'Dr. Fatima Zerhouni',
      status: PatientStatus.COMPLETED,
      statusHistory: [
        { id: 'sh-2', previousStatus: PatientStatus.NEW, newStatus: PatientStatus.IN_TREATMENT, changedAt: new Date(2025, 0, 21), changedBy: 'dr-2' },
        { id: 'sh-3', previousStatus: PatientStatus.IN_TREATMENT, newStatus: PatientStatus.COMPLETED, changedAt: new Date(2025, 1, 5), changedBy: 'dr-2' },
      ],
      careType: 'Blanchiment',
      careTotal: 25000,
      careTotalLocked: true,
      payments: [{ id: 'pay-3', amount: 25000, date: new Date(2025, 0, 20), recordedBy: 'rec-1' }],
      createdAt: new Date(2025, 0, 20),
      updatedAt: new Date(2025, 1, 5),
      nextAppointmentId: null,
      notificationConsent: true,
      isDeleted: false,
      medicalNotes: '',
    },
    {
      id: 'pat-3',
      name: 'Omar Hamidi',
      phone: '0557890123',
      doctorId: 'dr-3',
      doctorName: 'Dr. Karim Mansouri',
      status: PatientStatus.IN_TREATMENT,
      statusHistory: [{ id: 'sh-4', previousStatus: PatientStatus.NEW, newStatus: PatientStatus.IN_TREATMENT, changedAt: new Date(2025, 1, 2), changedBy: 'dr-3' }],
      careType: 'Extraction',
      careTotal: 15000,
      careTotalLocked: true,
      payments: [{ id: 'pay-4', amount: 5000, date: new Date(2025, 1, 1), recordedBy: 'rec-1' }],
      createdAt: new Date(2025, 1, 1),
      updatedAt: new Date(2025, 1, 2),
      nextAppointmentId: 'apt-2',
      notificationConsent: null,
      isDeleted: false,
      medicalNotes: '',
    },
    {
      id: 'pat-4',
      name: 'Amina Bouzid',
      phone: '0558901234',
      doctorId: 'dr-1',
      doctorName: 'Dr. Ahmed Benali',
      status: PatientStatus.NEW,
      statusHistory: [],
      careType: null,
      careTotal: 0,
      careTotalLocked: false,
      payments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      nextAppointmentId: null,
      notificationConsent: null,
      isDeleted: false,
      medicalNotes: '',
    },
    {
      id: 'pat-5',
      name: 'Karim Messaoudi',
      phone: '0559012345',
      doctorId: 'dr-2',
      doctorName: 'Dr. Fatima Zerhouni',
      status: PatientStatus.NO_SHOW,
      statusHistory: [
        { id: 'sh-5', previousStatus: PatientStatus.NEW, newStatus: PatientStatus.IN_TREATMENT, changedAt: new Date(2025, 0, 25), changedBy: 'dr-2' },
        { id: 'sh-6', previousStatus: PatientStatus.IN_TREATMENT, newStatus: PatientStatus.NO_SHOW, changedAt: new Date(2025, 1, 3), changedBy: 'rec-1', reason: 'Patient absent au RDV' },
      ],
      careType: 'Consultation',
      careTotal: 5000,
      careTotalLocked: true,
      payments: [],
      createdAt: new Date(2025, 0, 24),
      updatedAt: new Date(2025, 1, 3),
      nextAppointmentId: null,
      notificationConsent: false,
      isDeleted: false,
      medicalNotes: '',
    },
  ];
}

function createDemoDoctors(): Doctor[] {
  return [
    { id: 'dr-1', name: 'Dr. Ahmed Benali', phone: '0551234567', password: '123', createdAt: new Date(2024, 0, 1) },
    { id: 'dr-2', name: 'Dr. Fatima Zerhouni', phone: '0552345678', password: '123', createdAt: new Date(2024, 0, 1) },
    { id: 'dr-3', name: 'Dr. Karim Mansouri', phone: '0553456789', password: '123', createdAt: new Date(2024, 0, 1) },
  ];
}

function createDemoReceptionists(): Receptionist[] {
  return [
    { id: 'rec-1', name: 'Sarah Amrani', phone: '0554567890', password: '123', createdAt: new Date(2024, 0, 1) },
  ];
}

function createDemoAppointments(): Appointment[] {
  return [
    {
      id: 'apt-1',
      patientId: 'pat-1',
      doctorId: 'dr-1',
      date: new Date(2025, 1, 10, 10, 0),
      duration: 60,
      careType: 'Implant dentaire',
      confirmation: AppointmentConfirmation.CONFIRMED,
      completed: false,
    },
    {
      id: 'apt-2',
      patientId: 'pat-3',
      doctorId: 'dr-3',
      date: new Date(2025, 1, 8, 14, 30),
      duration: 30,
      careType: 'Extraction',
      confirmation: AppointmentConfirmation.PENDING,
      completed: false,
    },
  ];
}

function createDemoAuditLogs(): AuditLogEntry[] {
  return [
    {
      id: 'log-1',
      actionType: AuditActionType.PATIENT_CREATED,
      actorRole: 'receptionist',
      actorId: 'rec-1',
      actorName: 'Sarah Amrani',
      timestamp: new Date(2025, 0, 15),
      patientId: 'pat-1',
      patientName: 'Mohamed Kadi',
      details: 'Patient créé et assigné à Dr. Ahmed Benali',
    },
    {
      id: 'log-2',
      actionType: AuditActionType.CARE_ASSIGNED,
      actorRole: 'doctor',
      actorId: 'dr-1',
      actorName: 'Dr. Ahmed Benali',
      timestamp: new Date(2025, 0, 16),
      patientId: 'pat-1',
      patientName: 'Mohamed Kadi',
      details: 'Soin assigné: Implant dentaire — Total: 80 000 DA',
    },
    {
      id: 'log-3',
      actionType: AuditActionType.PAYMENT_ADDED,
      actorRole: 'receptionist',
      actorId: 'rec-1',
      actorName: 'Sarah Amrani',
      timestamp: new Date(2025, 0, 15),
      patientId: 'pat-1',
      patientName: 'Mohamed Kadi',
      details: 'Paiement de 20 000 DA enregistré',
    },
    {
      id: 'log-4',
      actionType: AuditActionType.STATUS_CHANGED,
      actorRole: 'system',
      actorId: 'system',
      actorName: 'Système',
      timestamp: new Date(2025, 1, 3),
      patientId: 'pat-5',
      patientName: 'Karim Messaoudi',
      details: 'Statut changé: En traitement → Absent',
    },
  ];
}

// ─── Store Interface ────────────────────────────────────────

interface ClinicState {
  patients: Patient[];
  doctors: Doctor[];
  receptionists: Receptionist[];
  appointments: Appointment[];
  auditLogs: AuditLogEntry[];
  
  // Patient actions
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'payments' | 'isDeleted' | 'medicalNotes'>, actorId: string, actorName: string, actorRole: ActorRole) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  updatePatientStatus: (id: string, newStatus: PatientStatus, changedBy: string, reason?: string) => void;
  softDeletePatient: (id: string, actorId: string, actorName: string, actorRole: ActorRole) => void;
  restorePatient: (id: string, actorId: string, actorName: string) => void;
  addPayment: (patientId: string, amount: number, recordedBy: string, recorderName: string, actorRole: ActorRole) => void;
  setCareType: (patientId: string, careType: CareType, total: number, doctorId: string, doctorName: string) => void;
  markCompleted: (patientId: string, actorId: string, actorName: string, actorRole: ActorRole, forceOverride?: boolean) => { success: boolean; reason?: string };
  updateMedicalNotes: (patientId: string, notes: string) => void;
  
  // Doctor actions
  addDoctor: (doctor: Omit<Doctor, 'id' | 'createdAt'>) => Doctor;
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  
  // Receptionist actions
  addReceptionist: (receptionist: Omit<Receptionist, 'id' | 'createdAt'>) => Receptionist;
  deleteReceptionist: (id: string) => void;
  
  // Appointment actions
  addAppointment: (appointment: Omit<Appointment, 'id'>, actorId: string, actorName: string, actorRole: ActorRole, forceOverride?: boolean) => { success: boolean; appointment?: Appointment; conflict?: ConflictCheckResult };
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: string, actorId: string, actorName: string, actorRole: ActorRole) => void;
  confirmAppointment: (id: string, actorId: string, actorName: string, actorRole: ActorRole) => void;
  
  // Audit
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  
  // Getters
  getPatientsByDoctor: (doctorId: string) => Patient[];
  getPatientsByStatus: (status: PatientStatus) => Patient[];
  getAppointmentsByDoctor: (doctorId: string) => Appointment[];
  getUpcomingAppointments: (hoursAhead: number) => Appointment[];
  getActivePatients: () => Patient[];
  
  // Reset
  resetToDemo: () => void;
}

export const useClinicStore = create<ClinicState>()(
  persist(
    (set, get) => ({
      patients: createDemoPatients(),
      doctors: createDemoDoctors(),
      receptionists: createDemoReceptionists(),
      appointments: createDemoAppointments(),
      auditLogs: createDemoAuditLogs(),

      // ─── Audit Log ──────────────────────────────────────

      addAuditLog: (entry) => {
        const logEntry: AuditLogEntry = {
          ...entry,
          id: generateId(),
          timestamp: new Date(),
        };
        set((state) => ({ auditLogs: [logEntry, ...state.auditLogs] }));
      },

      // ─── Patient Actions ────────────────────────────────

      addPatient: (patientData, actorId, actorName, actorRole) => {
        const newPatient: Patient = {
          ...patientData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          statusHistory: [],
          payments: [],
          isDeleted: false,
          medicalNotes: '',
        };
        set((state) => ({ patients: [newPatient, ...state.patients] }));

        get().addAuditLog({
          actionType: AuditActionType.PATIENT_CREATED,
          actorRole,
          actorId,
          actorName,
          patientId: newPatient.id,
          patientName: newPatient.name,
          details: `Patient créé et assigné à ${newPatient.doctorName}`,
        });

        return newPatient;
      },

      updatePatient: (id, updates) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        }));
      },

      updatePatientStatus: (id, newStatus, changedBy, reason) => {
        const patient = get().patients.find((p) => p.id === id);
        if (!patient) return;

        set((state) => ({
          patients: state.patients.map((p) => {
            if (p.id !== id) return p;
            const historyEntry: StatusHistoryEntry = {
              id: generateId(),
              previousStatus: p.status,
              newStatus,
              changedAt: new Date(),
              changedBy,
              reason,
            };
            return {
              ...p,
              status: newStatus,
              statusHistory: [...p.statusHistory, historyEntry],
              updatedAt: new Date(),
            };
          }),
        }));

        get().addAuditLog({
          actionType: AuditActionType.STATUS_CHANGED,
          actorRole: 'system',
          actorId: changedBy,
          actorName: changedBy,
          patientId: id,
          patientName: patient.name,
          details: `Statut: ${patient.status} → ${newStatus}${reason ? ` — ${reason}` : ''}`,
        });
      },

      softDeletePatient: (id, actorId, actorName, actorRole) => {
        const patient = get().patients.find((p) => p.id === id);
        if (!patient) return;

        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id ? { ...p, isDeleted: true, updatedAt: new Date() } : p
          ),
        }));

        get().addAuditLog({
          actionType: AuditActionType.PATIENT_DELETED,
          actorRole,
          actorId,
          actorName,
          patientId: id,
          patientName: patient.name,
          details: `Patient supprimé (soft delete)`,
        });
      },

      restorePatient: (id, actorId, actorName) => {
        const patient = get().patients.find((p) => p.id === id);
        if (!patient) return;

        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id ? { ...p, isDeleted: false, updatedAt: new Date() } : p
          ),
        }));

        get().addAuditLog({
          actionType: AuditActionType.PATIENT_RESTORED,
          actorRole: 'owner',
          actorId,
          actorName,
          patientId: id,
          patientName: patient.name,
          details: 'Patient restauré',
        });
      },

      addPayment: (patientId, amount, recordedBy, recorderName, actorRole) => {
        const payment: Payment = {
          id: generateId(),
          amount,
          date: new Date(),
          recordedBy,
        };

        const patient = get().patients.find((p) => p.id === patientId);

        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? { ...p, payments: [...p.payments, payment], updatedAt: new Date() }
              : p
          ),
        }));

        if (patient) {
          get().addAuditLog({
            actionType: AuditActionType.PAYMENT_ADDED,
            actorRole,
            actorId: recordedBy,
            actorName: recorderName,
            patientId,
            patientName: patient.name,
            details: `Paiement de ${amount.toLocaleString()} DA enregistré`,
          });
        }
      },

      setCareType: (patientId, careType, total, doctorId, doctorName) => {
        const patient = get().patients.find((p) => p.id === patientId);
        if (!patient) return;

        set((state) => ({
          patients: state.patients.map((p) => {
            if (p.id !== patientId) return p;
            const updates: Partial<Patient> = {
              careType,
              careTotal: total,
              careTotalLocked: true,
              updatedAt: new Date(),
            };
            if (p.status === PatientStatus.NEW) {
              const historyEntry: StatusHistoryEntry = {
                id: generateId(),
                previousStatus: p.status,
                newStatus: PatientStatus.IN_TREATMENT,
                changedAt: new Date(),
                changedBy: doctorId,
              };
              updates.status = PatientStatus.IN_TREATMENT;
              updates.statusHistory = [...p.statusHistory, historyEntry];
            }
            return { ...p, ...updates };
          }),
        }));

        get().addAuditLog({
          actionType: AuditActionType.CARE_ASSIGNED,
          actorRole: 'doctor',
          actorId: doctorId,
          actorName: doctorName,
          patientId,
          patientName: patient.name,
          details: `Soin: ${careType} — Total: ${total.toLocaleString()} DA`,
        });
      },

      markCompleted: (patientId, actorId, actorName, actorRole, forceOverride = false) => {
        const patient = get().patients.find((p) => p.id === patientId);
        if (!patient) return { success: false, reason: 'Patient introuvable' };

        const remaining = calculateRemaining(patient);

        // Block if unpaid, unless owner overrides
        if (remaining > 0 && !forceOverride) {
          if (actorRole !== 'owner') {
            return { success: false, reason: `Reste à payer: ${remaining.toLocaleString()} DA` };
          }
        }

        if (patient.status === PatientStatus.NEW) {
          return { success: false, reason: 'Aucun soin sélectionné' };
        }

        get().updatePatientStatus(patientId, PatientStatus.COMPLETED, actorId, 'Soin terminé');

        if (forceOverride && remaining > 0) {
          get().addAuditLog({
            actionType: AuditActionType.COMPLETED_OVERRIDE,
            actorRole,
            actorId,
            actorName,
            patientId,
            patientName: patient.name,
            details: `Complétion forcée avec ${remaining.toLocaleString()} DA restant`,
          });
        }

        return { success: true };
      },

      updateMedicalNotes: (patientId, notes) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId ? { ...p, medicalNotes: notes, updatedAt: new Date() } : p
          ),
        }));
      },

      // ─── Doctor Actions ──────────────────────────────────

      addDoctor: (doctorData) => {
        const newDoctor: Doctor = { ...doctorData, id: generateId(), createdAt: new Date() };
        set((state) => ({ doctors: [...state.doctors, newDoctor] }));
        return newDoctor;
      },

      updateDoctor: (id, updates) => {
        set((state) => ({
          doctors: state.doctors.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        }));
      },

      deleteDoctor: (id) => {
        set((state) => ({ doctors: state.doctors.filter((d) => d.id !== id) }));
      },

      // ─── Receptionist Actions ─────────────────────────────

      addReceptionist: (receptionistData) => {
        const newReceptionist: Receptionist = { ...receptionistData, id: generateId(), createdAt: new Date() };
        set((state) => ({ receptionists: [...state.receptionists, newReceptionist] }));
        return newReceptionist;
      },

      deleteReceptionist: (id) => {
        set((state) => ({ receptionists: state.receptionists.filter((r) => r.id !== id) }));
      },

      // ─── Appointment Actions ──────────────────────────────

      addAppointment: (appointmentData, actorId, actorName, actorRole, forceOverride = false) => {
        const conflict = checkSchedulingConflict(
          { doctorId: appointmentData.doctorId, date: new Date(appointmentData.date), duration: appointmentData.duration },
          get().appointments
        );

        if (conflict.hasConflict && !forceOverride) {
          if (actorRole !== 'owner') {
            return { success: false, conflict };
          }
        }

        const newAppointment: Appointment = { ...appointmentData, id: generateId() };
        set((state) => ({ appointments: [...state.appointments, newAppointment] }));

        const patient = get().patients.find((p) => p.id === appointmentData.patientId);

        get().addAuditLog({
          actionType: AuditActionType.APPOINTMENT_SCHEDULED,
          actorRole,
          actorId,
          actorName,
          patientId: appointmentData.patientId,
          patientName: patient?.name,
          details: `RDV planifié: ${new Date(appointmentData.date).toLocaleDateString('fr-FR')} à ${new Date(appointmentData.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
        });

        if (conflict.hasConflict && forceOverride) {
          get().addAuditLog({
            actionType: AuditActionType.SCHEDULING_OVERRIDE,
            actorRole,
            actorId,
            actorName,
            patientId: appointmentData.patientId,
            patientName: patient?.name,
            details: `Conflit de planification ignoré par ${actorName}`,
          });
        }

        return { success: true, appointment: newAppointment };
      },

      updateAppointment: (id, updates) => {
        set((state) => ({
          appointments: state.appointments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
      },

      cancelAppointment: (id, actorId, actorName, actorRole) => {
        const apt = get().appointments.find((a) => a.id === id);
        const patient = apt ? get().patients.find((p) => p.id === apt.patientId) : undefined;

        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, confirmation: AppointmentConfirmation.CANCELLED } : a
          ),
        }));

        get().addAuditLog({
          actionType: AuditActionType.APPOINTMENT_CANCELLED,
          actorRole,
          actorId,
          actorName,
          patientId: apt?.patientId,
          patientName: patient?.name,
          details: `RDV annulé`,
        });
      },

      confirmAppointment: (id, actorId, actorName, actorRole) => {
        const apt = get().appointments.find((a) => a.id === id);
        const patient = apt ? get().patients.find((p) => p.id === apt.patientId) : undefined;

        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, confirmation: AppointmentConfirmation.CONFIRMED } : a
          ),
        }));

        get().addAuditLog({
          actionType: AuditActionType.APPOINTMENT_CONFIRMED,
          actorRole,
          actorId,
          actorName,
          patientId: apt?.patientId,
          patientName: patient?.name,
          details: `RDV confirmé`,
        });
      },

      // ─── Getters ──────────────────────────────────────────

      getPatientsByDoctor: (doctorId) => get().patients.filter((p) => p.doctorId === doctorId && !p.isDeleted),
      getPatientsByStatus: (status) => get().patients.filter((p) => p.status === status && !p.isDeleted),
      getAppointmentsByDoctor: (doctorId) => get().appointments.filter((a) => a.doctorId === doctorId),
      getUpcomingAppointments: (hoursAhead) => {
        const now = new Date();
        const cutoff = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
        return get().appointments.filter((a) => {
          const aptDate = new Date(a.date);
          return aptDate > now && aptDate <= cutoff && !a.completed;
        });
      },
      getActivePatients: () => get().patients.filter((p) => !p.isDeleted),

      // ─── Reset ────────────────────────────────────────────

      resetToDemo: () => {
        set({
          patients: createDemoPatients(),
          doctors: createDemoDoctors(),
          receptionists: createDemoReceptionists(),
          appointments: createDemoAppointments(),
          auditLogs: createDemoAuditLogs(),
        });
      },
    }),
    {
      name: 'nedjma-clinic-store',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str, (key, value) => {
            if (value && typeof value === 'object' && value.__type === 'Date') {
              return new Date(value.value);
            }
            return value;
          });
        },
        setItem: (name, value) => {
          localStorage.setItem(
            name,
            JSON.stringify(value, (key, val) => {
              if (val instanceof Date) {
                return { __type: 'Date', value: val.toISOString() };
              }
              return val;
            })
          );
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
