// Audit Log Types - Immutable, read-only log for Owner

export enum AuditActionType {
  PATIENT_CREATED = 'PATIENT_CREATED',
  PATIENT_DELETED = 'PATIENT_DELETED',
  PATIENT_RESTORED = 'PATIENT_RESTORED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  PAYMENT_ADDED = 'PAYMENT_ADDED',
  PAYMENT_MODIFIED = 'PAYMENT_MODIFIED',
  CARE_ASSIGNED = 'CARE_ASSIGNED',
  APPOINTMENT_SCHEDULED = 'APPOINTMENT_SCHEDULED',
  APPOINTMENT_CHANGED = 'APPOINTMENT_CHANGED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  COMPLETED_OVERRIDE = 'COMPLETED_OVERRIDE',
  SCHEDULING_OVERRIDE = 'SCHEDULING_OVERRIDE',
}

export type ActorRole = 'owner' | 'doctor' | 'receptionist' | 'patient' | 'system';

export interface AuditLogEntry {
  id: string;
  actionType: AuditActionType;
  actorRole: ActorRole;
  actorId: string;
  actorName: string;
  timestamp: Date;
  patientId?: string;
  patientName?: string;
  details: string;
  metadata?: Record<string, unknown>;
}

export const AUDIT_ACTION_LABELS: Record<AuditActionType, string> = {
  [AuditActionType.PATIENT_CREATED]: 'Patient créé',
  [AuditActionType.PATIENT_DELETED]: 'Patient supprimé',
  [AuditActionType.PATIENT_RESTORED]: 'Patient restauré',
  [AuditActionType.STATUS_CHANGED]: 'Statut modifié',
  [AuditActionType.PAYMENT_ADDED]: 'Paiement ajouté',
  [AuditActionType.PAYMENT_MODIFIED]: 'Paiement modifié',
  [AuditActionType.CARE_ASSIGNED]: 'Soin assigné',
  [AuditActionType.APPOINTMENT_SCHEDULED]: 'RDV planifié',
  [AuditActionType.APPOINTMENT_CHANGED]: 'RDV modifié',
  [AuditActionType.APPOINTMENT_CANCELLED]: 'RDV annulé',
  [AuditActionType.APPOINTMENT_CONFIRMED]: 'RDV confirmé',
  [AuditActionType.COMPLETED_OVERRIDE]: 'Complétion forcée',
  [AuditActionType.SCHEDULING_OVERRIDE]: 'Conflit ignoré',
};

export const AUDIT_ACTION_COLORS: Record<AuditActionType, string> = {
  [AuditActionType.PATIENT_CREATED]: 'text-blue-600',
  [AuditActionType.PATIENT_DELETED]: 'text-red-600',
  [AuditActionType.PATIENT_RESTORED]: 'text-green-600',
  [AuditActionType.STATUS_CHANGED]: 'text-amber-600',
  [AuditActionType.PAYMENT_ADDED]: 'text-green-600',
  [AuditActionType.PAYMENT_MODIFIED]: 'text-amber-600',
  [AuditActionType.CARE_ASSIGNED]: 'text-blue-600',
  [AuditActionType.APPOINTMENT_SCHEDULED]: 'text-blue-600',
  [AuditActionType.APPOINTMENT_CHANGED]: 'text-amber-600',
  [AuditActionType.APPOINTMENT_CANCELLED]: 'text-red-600',
  [AuditActionType.APPOINTMENT_CONFIRMED]: 'text-green-600',
  [AuditActionType.COMPLETED_OVERRIDE]: 'text-red-600',
  [AuditActionType.SCHEDULING_OVERRIDE]: 'text-red-600',
};
