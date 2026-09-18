/**
 * Clinics run through Cal.com — payment is collected at booking on the
 * calendar itself, so the intake form's job is purely registration
 * details (medical, emergency contact, consent).
 */
export type ClinicId =
  | "ballina-u10-u12"
  | "ballina-u13-u15"
  | "coffs-u10-u12"
  | "coffs-u13-u15"
  | "innisfail-u10-u12"
  | "innisfail-u13-u16";

export type Clinic = {
  label: string;
  /** Cal.com event-type slug — used to deep-link back to the calendar. */
  calSlug: string;
};

export const CLINICS: Record<ClinicId, Clinic> = {
  "ballina-u10-u12": {
    label: "Ballina School Holiday Clinic — U10-U12",
    calSlug: "ballina-school-holiday-clinic-u10-u12",
  },
  "ballina-u13-u15": {
    label: "Ballina School Holiday Clinic — U13-U15",
    calSlug: "ballina-school-holiday-clinic-u13-u15",
  },
  "coffs-u10-u12": {
    label: "Coffs Harbour School Holiday Clinic — U10-U12",
    calSlug: "coffs-harbour-school-holiday-clinic-u10-u12",
  },
  "coffs-u13-u15": {
    label: "Coffs Harbour School Holiday Clinic — U13-U15",
    calSlug: "coffs-harbour-school-holiday-clinic-u13-u15",
  },
  "innisfail-u10-u12": {
    label: "Innisfail Netball Clinic — U10-U12",
    calSlug: "innisfail-netball-clinic-u10-u12",
  },
  "innisfail-u13-u16": {
    label: "Innisfail Netball Clinic — U13-U16",
    calSlug: "innisfail-netball-clinic-u13-u16",
  },
};

export const CLINIC_ORDER: ClinicId[] = [
  "ballina-u10-u12",
  "ballina-u13-u15",
  "coffs-u10-u12",
  "coffs-u13-u15",
  "innisfail-u10-u12",
  "innisfail-u13-u16",
];

export function isClinicId(value: string): value is ClinicId {
  return (CLINIC_ORDER as readonly string[]).includes(value);
}
