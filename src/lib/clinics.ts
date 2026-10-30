/**
 * Clinics run through Cal.com — payment is collected at booking on the
 * calendar itself, so the intake form's job is purely registration
 * details (medical, emergency contact, consent).
 */
export type ClinicId =
  | "innisfail-u9-u11"
  | "innisfail-u12-u14"
  | "tableland-u9-u11"
  | "tableland-u12-u16"
  | "cairns-u9-u11"
  | "cairns-u12-u14"
  | "ballina-u10-u12"
  | "ballina-u13-u15"
  | "coffs-u10-u12"
  | "coffs-u13-u15";

export type Clinic = {
  label: string;
  /** Cal.com event-type slug — used to deep-link back to the calendar. */
  calSlug: string;
};

export const CLINICS: Record<ClinicId, Clinic> = {
  "innisfail-u9-u11": {
    label: "Innisfail Netball Clinic — U9-U11 (Thu 5 Nov · 3:45-5pm)",
    calSlug: "innisfail-netball-clinic-u9-u11",
  },
  "innisfail-u12-u14": {
    label: "Innisfail Netball Clinic — U12-U14 (Thu 5 Nov · 5-6:15pm)",
    calSlug: "innisfail-netball-clinic-u12-u14",
  },
  "tableland-u9-u11": {
    label: "Tableland Netball Clinic — U9-U11 (Fri 6 Nov)",
    calSlug: "tableland-netball-clinic-u9-u11",
  },
  "tableland-u12-u16": {
    label: "Tableland Netball Clinic — U12-U16 (Fri 6 Nov)",
    calSlug: "tableland-netball-clinic-u12-u16",
  },
  "cairns-u9-u11": {
    label: "Cairns Netball Clinic — U9-U11 (Mon 9 Nov)",
    calSlug: "cairns-netball-clinic-u9-u11",
  },
  "cairns-u12-u14": {
    label: "Cairns Netball Clinic — U12-U14 (Mon 9 Nov)",
    calSlug: "cairns-netball-clinic-u12-u14",
  },
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
};

export const CLINIC_ORDER: ClinicId[] = [
  "innisfail-u9-u11",
  "innisfail-u12-u14",
  "tableland-u9-u11",
  "tableland-u12-u16",
  "cairns-u9-u11",
  "cairns-u12-u14",
  "ballina-u10-u12",
  "ballina-u13-u15",
  "coffs-u10-u12",
  "coffs-u13-u15",
];

export function isClinicId(value: string): value is ClinicId {
  return (CLINIC_ORDER as readonly string[]).includes(value);
}
