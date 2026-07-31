export type ShopProduct = {
  slug: string;
  name: string;
  short: string;
  description: string;
  features: string[];
  price: string | null; // null = pricing to be announced
  bestFor: string;
  /** Icon key mapped in the shop pages to a lucide icon. */
  icon:
    | "clipboard-list"
    | "trophy"
    | "target"
    | "zap"
    | "compass";
};

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    slug: "trial-app",
    name: "Trial App",
    short:
      "Run trials that pick themselves — attendance, rotations and balanced teams, done in one place.",
    description:
      "Trial App takes the chaos out of trial night. Share a registration link, players sign up in advance, and attendance is captured live on the night. Games populate automatically based on who's there, with every player rotated through their preferred positions across unbiased, balanced teams. A team-building view gives selectors a clear picture of every athlete who trialled — and all data exports to a spreadsheet you can save.",
    features: [
      "Shareable player registration link",
      "Live attendance recorded on the night",
      "Games auto-populated from attendance",
      "Players rotated through preferred positions",
      "Unbiased team distribution for every round",
      "Team-building view for selectors",
      "Full data export to spreadsheet",
      "Per-participant pricing — pass on or absorb the fee",
      "Optional add-on fees for umpires, selectors, court hire",
    ],
    price: null,
    bestFor: "Clubs and associations running structured trials",
    icon: "clipboard-list",
  },
  {
    slug: "competition-builder",
    name: "Competition Builder",
    short:
      "Build a full season fixture — grading games, divisions and draws — in minutes.",
    description:
      "Competition Builder lets you set up an entire competition in the time it usually takes to make a coffee. Enter your teams, courts, time slots and season length, and the app generates grading games and the full fixture automatically. Results from grading rounds feed intelligent recommendations on team placement — move them up, hold, or drop a division. The engine optimises division sizes so every team plays as much netball as possible with the fewest byes.",
    features: [
      "Full season fixture generated in minutes",
      "Grading games auto-populated",
      "Placement recommendations from grading results",
      "Optimal division sizes to minimise byes",
      "Court, time slot and team-count aware",
      "Simple team-count confirmation flow",
    ],
    price: null,
    bestFor: "Associations and league organisers",
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
    bestFor: "Weekly club and school teams",
    icon: "target",
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
    bestFor: "Representative squads and club tournament teams",
    icon: "zap",
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
    bestFor: "Head coaches building a program",
    icon: "compass",
  },
];

export function getProductBySlug(slug: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((p) => p.slug === slug);
}
