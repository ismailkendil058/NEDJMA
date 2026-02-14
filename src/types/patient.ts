// Patient Status Enum - Core status flow for the clinic
export enum PatientStatus {
  NEW = 'NEW',                     // Patient created, no soin selected
  IN_TREATMENT = 'IN_TREATMENT',   // Soin selected, treatment ongoing
  COMPLETED = 'COMPLETED',         // Treatment finished
  CANCELLED = 'CANCELLED',         // Treatment cancelled
  NO_SHOW = 'NO_SHOW',             // Patient didn't show up
}

// Payment Status - Auto-calculated based on payments
export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
}

// Appointment confirmation status
export enum AppointmentConfirmation {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  UNCONFIRMED = 'UNCONFIRMED',
}

// Care/Treatment types available
export const CARE_TYPES = [
  'Consultation',
  'Détartrage',
  'Blanchiment',
  'Extraction',
  'Implant dentaire',
  'Couronne',
  'Bridge',
  'Orthodontie',
  'Traitement de canal',
] as const;

export type CareType = typeof CARE_TYPES[number];

// Duration in minutes for each care type
export const CARE_DURATIONS: Record<CareType, number> = {
  'Consultation': 30,
  'Détartrage': 30,
  'Blanchiment': 60,
  'Extraction': 30,
  'Implant dentaire': 60,
  'Couronne': 60,
  'Bridge': 60,
  'Orthodontie': 60,
  'Traitement de canal': 60,
};

// Payment record for installments
export interface Payment {
  id: string;
  amount: number;
  date: Date;
  recordedBy: string; // User ID who recorded the payment
}

// Appointment record
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  duration: number; // in minutes
  careType: CareType;
  confirmation: AppointmentConfirmation;
  completed: boolean;
  notes?: string;
}

// Status history entry for audit
export interface StatusHistoryEntry {
  id: string;
  previousStatus: PatientStatus;
  newStatus: PatientStatus;
  changedAt: Date;
  changedBy: string; // User ID
  reason?: string;
}

// Main Patient interface
export interface Patient {
  id: string;
  name: string;
  phone: string;
  doctorId: string;
  doctorName: string;
  
  // Status
  status: PatientStatus;
  statusHistory: StatusHistoryEntry[];
  
  // Treatment
  careType: CareType | null;
  careTotal: number; // Locked once set by doctor
  careTotalLocked: boolean;
  
  // Payments
  payments: Payment[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Appointments
  nextAppointmentId: string | null;
  
  // Notifications
  notificationConsent: boolean | null; // null = not asked yet
  
  // Soft delete
  isDeleted: boolean;
  
  // Medical notes (doctor-only)
  medicalNotes: string;
}

// Doctor interface
export interface Doctor {
  id: string;
  name: string;
  phone: string;
  password: string; // In real app, this would be hashed
  createdAt: Date;
}

// Receptionist interface
export interface Receptionist {
  id: string;
  name: string;
  phone: string;
  password: string;
  createdAt: Date;
}

// Helper functions for payment calculations
export function calculateTotalPaid(patient: Patient): number {
  return patient.payments.reduce((sum, p) => sum + p.amount, 0);
}

export function calculateRemaining(patient: Patient): number {
  return Math.max(0, patient.careTotal - calculateTotalPaid(patient));
}

export function calculatePaidPercentage(patient: Patient): number {
  if (patient.careTotal === 0) return 0;
  return Math.round((calculateTotalPaid(patient) / patient.careTotal) * 100);
}

export function getPaymentStatus(patient: Patient): PaymentStatus {
  const paid = calculateTotalPaid(patient);
  if (paid === 0) return PaymentStatus.UNPAID;
  if (paid >= patient.careTotal) return PaymentStatus.PAID;
  return PaymentStatus.PARTIAL;
}

// Check if patient can be marked as completed
export function canMarkCompleted(patient: Patient): { allowed: boolean; reason?: string } {
  const remaining = calculateRemaining(patient);
  if (remaining > 0) {
    return { 
      allowed: false, 
      reason: `Reste à payer: ${remaining.toLocaleString()} DA` 
    };
  }
  if (patient.status === PatientStatus.NEW) {
    return { 
      allowed: false, 
      reason: 'Aucun soin sélectionné' 
    };
  }
  return { allowed: true };
}

// Status color mapping (using semantic tokens)
export const STATUS_COLORS: Record<PatientStatus, { bg: string; text: string; dot: string }> = {
  [PatientStatus.NEW]: { 
    bg: 'bg-blue-50', 
    text: 'text-blue-700', 
    dot: 'bg-blue-500' 
  },
  [PatientStatus.IN_TREATMENT]: { 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    dot: 'bg-amber-500' 
  },
  [PatientStatus.COMPLETED]: { 
    bg: 'bg-green-50', 
    text: 'text-green-700', 
    dot: 'bg-green-500' 
  },
  [PatientStatus.CANCELLED]: { 
    bg: 'bg-red-50', 
    text: 'text-red-700', 
    dot: 'bg-red-500' 
  },
  [PatientStatus.NO_SHOW]: { 
    bg: 'bg-gray-100', 
    text: 'text-gray-700', 
    dot: 'bg-gray-500' 
  },
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, { bg: string; text: string }> = {
  [PaymentStatus.UNPAID]: { bg: 'bg-red-50', text: 'text-red-700' },
  [PaymentStatus.PARTIAL]: { bg: 'bg-amber-50', text: 'text-amber-700' },
  [PaymentStatus.PAID]: { bg: 'bg-green-50', text: 'text-green-700' },
};

// Status labels in French
export const STATUS_LABELS: Record<PatientStatus, string> = {
  [PatientStatus.NEW]: 'Nouveau',
  [PatientStatus.IN_TREATMENT]: 'En traitement',
  [PatientStatus.COMPLETED]: 'Terminé',
  [PatientStatus.CANCELLED]: 'Annulé',
  [PatientStatus.NO_SHOW]: 'Absent',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: 'Non payé',
  [PaymentStatus.PARTIAL]: 'Partiel',
  [PaymentStatus.PAID]: 'Payé',
};
