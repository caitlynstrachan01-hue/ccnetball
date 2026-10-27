import type { AdditionalFee } from "@/lib/trial-fees";

/** Client-safe shapes for a trial shown on the public registration page.
 *  (No server imports here, so client components can use these types.) */

export type TrialSession = {
  id: string;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
};

export type TrialDivision = {
  id: string;
  name: string;
  feeCents: number;
  additionalFees: AdditionalFee[];
  associationPaysFees: boolean;
  sessions: TrialSession[];
};

export type TrialPublic = {
  id: string;
  slug: string;
  name: string;
  club: string;
  registrationOpen: boolean;
  status: string;
  divisions: TrialDivision[];
};
