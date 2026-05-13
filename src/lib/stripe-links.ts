export type ProgramId =
  | "1on1"
  | "small-group"
  | "team"
  | "video-analysis"
  | "online"
  | "coach-the-coaches";

export type ProgramPayment = {
  label: string;
  paymentUrl: string;
  payOnBooking: boolean;
};

export const PROGRAM_PAYMENTS: Record<ProgramId, ProgramPayment> = {
  "1on1": {
    label: "1-on-1 / 2-on-1 Training — $160 AUD",
    paymentUrl: "https://buy.stripe.com/00w4gy96dc9DcYR8tH7AI00",
    payOnBooking: false,
  },
  "small-group": {
    label: "Small Group Training — $60 AUD per athlete",
    paymentUrl: "https://buy.stripe.com/8x24gycip4Hb5wp39n7AI01",
    payOnBooking: false,
  },
  team: {
    label: "Team Training — $250 AUD",
    paymentUrl: "https://buy.stripe.com/6oU4gyaah5Lf1g9fW97AI02",
    payOnBooking: false,
  },
  "video-analysis": {
    label: "Video Game Analysis — $200 AUD",
    paymentUrl: "https://buy.stripe.com/cNi14m829ddH1g9cJX7AI03",
    payOnBooking: true,
  },
  online: {
    label: "Online Mentoring — $160 AUD",
    paymentUrl: "https://buy.stripe.com/4gMeVcbel5Lff6ZeS57AI04",
    payOnBooking: true,
  },
  "coach-the-coaches": {
    label: "Coach the Coaches — $80 AUD per coach (minimum 4)",
    paymentUrl: "https://buy.stripe.com/00waEW1DL1uZ0c525j7AI05",
    payOnBooking: false,
  },
};

export const PROGRAM_ORDER: ProgramId[] = [
  "1on1",
  "small-group",
  "team",
  "video-analysis",
  "online",
  "coach-the-coaches",
];
