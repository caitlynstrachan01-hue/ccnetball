export type PricingTier = {
  label: string;
  detail: string;
  price: string;
};

export type ShopProduct = {
  slug: string;
  name: string;
  short: string;
  description: string;
  features: string[];
  price: string | null; // null = pricing to be announced
  /** Optional tiered pricing table shown on the detail page. */
  pricingTiers?: PricingTier[];
  /** Optional pricing note shown below the price block. */
  pricingNote?: string;
  /** Short pink-chip highlights shown on the tile and in the detail sidebar. */
  highlights: string[];
  /** Icon key mapped in the shop pages to a lucide icon. */
  icon:
    | "clipboard-list"
    | "trophy"
    | "target"
    | "zap"
    | "compass"
    | "play-circle";
  /** Temporarily hide from the shop grid. Detail page URL still works. */
  hidden?: boolean;
};

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    slug: "drills-library",
    name: "Netball Drills Library",
    short:
      "A growing library of 200+ elite netball drills and skills — with a new shooting drill added every month.",
    description:
      "Every drill is designed and filmed by Caitlyn — the same work she uses with junior athletes, club squads, rep programs and coaches. Videos are grouped into focus areas — attacking movement, defending, team drills and more — and ordered so you can move through a category in the sequence Caitlyn recommends. When you're watching one drill, the next drills in the same focus area appear alongside so you can build a whole session in one sitting. A new shooting drill is added to the library every month.",
    features: [
      "200+ drills across every focus area",
      "Every drill filmed and coached by Caitlyn",
      "Videos ordered inside each category",
      "Suggestions from the same category while watching",
      "New shooting drill added every month",
      "Cancel any time",
    ],
    price: "$49 AUD per month",
    pricingNote:
      "Rolling monthly subscription — cancel any time from your account.",
    highlights: [
      "200+ Drills / Skills",
      "New Shooting Drill Monthly",
      "All Focus Areas",
      "Cancel Anytime",
    ],
    icon: "play-circle",
  },
  {
    slug: "trial-app",
    name: "Trial App",
    short:
      "Run trials that pick themselves — registration, attendance, and unbiased team allocation, done in one place.",
    description:
      "Trial App takes the chaos out of trial night. Set up your trial across one or more age groups, share a registration link, and players sign up themselves. Capture attendance live on the night — one age group at a time — then hit Populate and the app generates balanced games with every player rotated through their two preferred positions. Players used out of position are highlighted so selectors can see the trade-off. Two blank games sit at the end of every session for selectors to match specific players head-to-head.",
    features: [
      "Shareable player registration link — unlimited players",
      "One day per age group — trial as many age groups as you like",
      "Live attendance recorded per age group",
      "Populate teams with an unbiased algorithm",
      "Every player placed in their two preferred positions",
      "Out-of-position players highlighted for selectors",
      "Two selector-controlled blank games at the end of each session",
      "Export every page to CSV or print for the association",
      "Per-participant pricing — participants or the association pays",
      "Optional association add-ons for umpires, selectors, court hire",
      "Participant data retained for 1 month after the trial finishes, then deleted",
    ],
    price: "$2.20 AUD per participant",
    pricingNote:
      "Pay per participant at registration, or tick 'Association pays CC Netball fees' and get one invoice at the end of trials.",
    highlights: ["Netball Trials", "Club & Rep Teams", "Unbiased Population"],
    icon: "clipboard-list",
  },
  {
    slug: "competition-builder",
    name: "Competition Builder",
    short:
      "For messy netball competitions. Unlimited rules, so the quirks that break a spreadsheet draw just become part of the fixture.",
    description:
      "Competition Builder brings clarity to the messy real-world netball draw. Give it your courts, timeslots, teams and start date, and it builds the full season fixture — including grading rounds and byes — in minutes. Its point of difference is the unlimited rules engine: write any constraint you have as a plain sentence and the fixture is built around it, not patched afterwards. Rules can be anything — a team in Division 1 that cannot play at the same timeslot as a team in Division 3 because they share a coach, a court that is out of play for one specific game, a division that must always play on a certain court, a team that can only play early timeslots, and so on. It recommends team-per-division splits that maximise court time, but always defers to what you and your organisers decide.",
    features: [
      "Full season fixture in an afternoon",
      "Unlimited rules — any constraint you can describe",
      "Grading games auto-populated",
      "Recommended division splits to maximise court time",
      "You always have the final say on divisions and placements",
      "Court, timeslot and start-date aware",
    ],
    price: "$19.99 per competition",
    pricingNote:
      "One flat payment per competition — no tiers, no per-team charges. A licence covers you right up until the start date of the competition. Each new competition needs a fresh licence.",
    highlights: [
      "Unlimited Rules Engine",
      "Full Season Fixture",
      "Maximise Court Availability",
    ],
    icon: "trophy",
  },
  {
    slug: "game-day-standard",
    name: "Game Day Coaching App — Standard",
    short:
      "Coach every quarter — attendance, court time, live scoring and shooting %, all tracked in real time.",
    description:
      "The essential coaching companion for weekly club netball. Tracks training and game attendance, court time per player, and rolls with your subs. Live scoring runs alongside shooting percentage so you know exactly what's landing. Individual and team goals are tracked across the season with built-in review prompts, keeping players accountable and progress visible.",
    features: [
      "Training and game attendance tracked",
      "Court time recorded per player",
      "Rolling subs supported",
      "Live scoring with shooting percentage",
      "Individual and team goal tracking",
      "Automatic review prompts through the season",
    ],
    price: null,
    highlights: [
      "Court Time",
      "Attendance",
      "Individual & Team Goals",
      "Shooting Percentage",
      "Live Scoring",
      "Game Summary",
    ],
    icon: "target",
    hidden: true,
  },
  {
    slug: "game-day-tournament",
    name: "Game Day Coaching App — Tournament",
    short:
      "Purpose-built for rep and club tournaments — half games, rapid subs, and court time % done right.",
    description:
      "Designed for the tournament grind, where fixtures land at the last minute and games are shorter. Tracks training and game attendance, court time as a percentage across the tournament, and handles rolling subs seamlessly. Individual and team goals with review prompts, plus live scoring paired with shooting percentage, so you're managing the game and measuring impact at the same time.",
    features: [
      "Optimised for tournament-format (half) games",
      "Training and game attendance tracked",
      "Court time percentage across a tournament",
      "Rolling subs supported",
      "Live scoring with shooting percentage",
      "Individual and team goal tracking with prompts",
    ],
    price: null,
    highlights: [
      "Court Time",
      "Attendance",
      "Individual & Team Goals",
      "Shooting Percentage",
      "Live Scoring",
      "Game Summary",
    ],
    icon: "zap",
    hidden: true,
  },
  {
    slug: "campaign-plan",
    name: "Campaign Plan",
    short:
      "Plan a full season — on-court and off-court goals, with coaching accountability built in.",
    description:
      "Campaign Plan walks you through building the season your team deserves. Prompts guide you to summarise the season ahead, set on-court and off-court goals, and lock in coaching accountability at every stage. The result is a clear, considered plan that keeps coaches, players and support staff pointed at the same target — all the way through.",
    features: [
      "Guided season summary",
      "On-court and off-court goal setting",
      "Coaching accountability framework",
      "Whole-of-program clarity",
      "Reusable across seasons and teams",
    ],
    price: null,
    highlights: [
      "Season Planning",
      "On-Court & Off-Court Goals",
      "Coaching Accountability",
    ],
    icon: "compass",
    hidden: true,
  },
];

export function getProductBySlug(slug: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((p) => p.slug === slug);
}
