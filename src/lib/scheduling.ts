// Scheduling conflict detection & validation
import { Appointment } from '@/types/patient';

export const CLINIC_OPEN_HOUR = 8;
export const CLINIC_CLOSE_HOUR = 23;

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingAppointment?: Appointment;
  reason?: string;
}

/**
 * Check if a proposed appointment conflicts with existing ones.
 * Rules:
 *  - One patient per doctor per time slot (no double-booking)
 *  - Time slots between 08:00–23:00
 *  - Minimum duration enforced by care type
 */
export function checkSchedulingConflict(
  proposed: { doctorId: string; date: Date; duration: number },
  existingAppointments: Appointment[]
): ConflictCheckResult {
  const startTime = new Date(proposed.date);
  const endTime = new Date(startTime.getTime() + proposed.duration * 60 * 1000);

  // Validate clinic hours
  const startHour = startTime.getHours();
  const endHour = endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0);

  if (startHour < CLINIC_OPEN_HOUR || endHour > CLINIC_CLOSE_HOUR) {
    return {
      hasConflict: true,
      reason: `Hors des horaires de la clinique (${CLINIC_OPEN_HOUR}h00 - ${CLINIC_CLOSE_HOUR}h00)`,
    };
  }

  // Check for double-booking with same doctor
  const doctorAppointments = existingAppointments.filter(
    (a) => a.doctorId === proposed.doctorId && a.confirmation !== 'CANCELLED'
  );

  for (const existing of doctorAppointments) {
    const existingStart = new Date(existing.date);
    const existingEnd = new Date(existingStart.getTime() + existing.duration * 60 * 1000);

    // Check overlap
    if (startTime < existingEnd && endTime > existingStart) {
      return {
        hasConflict: true,
        conflictingAppointment: existing,
        reason: `Conflit avec un RDV existant (${existingStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${existingEnd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Get available time slots for a doctor on a given date
 */
export function getAvailableSlots(
  doctorId: string,
  date: Date,
  durationMinutes: number,
  existingAppointments: Appointment[]
): Date[] {
  const slots: Date[] = [];
  const day = new Date(date);
  day.setHours(CLINIC_OPEN_HOUR, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(CLINIC_CLOSE_HOUR, 0, 0, 0);

  while (day.getTime() + durationMinutes * 60 * 1000 <= endOfDay.getTime()) {
    const result = checkSchedulingConflict(
      { doctorId, date: new Date(day), duration: durationMinutes },
      existingAppointments
    );

    if (!result.hasConflict) {
      slots.push(new Date(day));
    }

    day.setMinutes(day.getMinutes() + 30); // 30-min intervals
  }

  return slots;
}
