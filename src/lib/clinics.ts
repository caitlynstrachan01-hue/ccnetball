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
  | "innisfail-u9-u11"
  | "innisfail-u12-u14";

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
  "innisfail-u9-u11": {
    label: "Innisfail Netball Clinic — U9-U11 (Thu 5 Nov · 3:45-5pm)",
    calSlug: "innisfail-netball-clinic-u9-u11",
  },
  "innisfail-u12-u14": {
    label: "Innisfail Netball Clinic — U12-U14 (Thu 5 Nov · 5-6:15pm)",
    calSlug: "innisfail-netball-clinic-u12-u14",
  },
};

export const CLINIC_ORDER: ClinicId[] = [
  "ballina-u10-u12",
  "ballina-u13-u15",
  "coffs-u10-u12",
  "coffs-u13-u15",
  "innisfail-u9-u11",
  "innisfail-u12-u14",
];

export function isClinicId(value: string): value is ClinicId {
  return (CLINIC_ORDER as readonly string[]).includes(value);
}
