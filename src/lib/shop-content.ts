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
  /** If set, the product is live — the detail page swaps "Add to cart" for a
   * "Launch" CTA linking here, and the "Coming Soon" badge is hidden. */
  launchUrl?: string;
  /** Optional preview stills shown in a gallery on the detail page. */
  previewImages?: Array<{ src: string; alt: string; caption?: string }>;
  /** Aspect ratio for the preview carousel frame, written as "W/H"
   *  (e.g. "1084/1870" for phone screenshots, "4/3" for laptop ones).
   *  Images are object-contain so smaller aspects get a neutral letterbox. */
  previewAspect?: string;
  /** Shop tile status. "live" = green LIVE badge + prominent CTA.
   * "launching-soon" = red diagonal "Launching …" veil.
   * Default (undefined) renders the tile plain. */
  status?: "live" | "launching-soon";
  /** Required when status === "launching-soon"; shown on the veil. */
  launchDate?: string;
  /** Short audience eyebrow shown above the product name, e.g. "For coaches".
   * Keeps marketing positioning consistent across the grid. */
  audience?: string;
};

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    slug: "court-planner",
    name: "Netball Court - Drawing",
    short:
      "An interactive netball court on your phone or tablet — draw drills in seconds at training or courtside.",
    description:
      "Netball Court - Drawing is a simple drawing tool that works on any phone or tablet. Draw a drill within seconds, pull one up to give your players feedback at quarter time, half time or three-quarter time, and save your drills and set plays into folders to come back to for reflection or review at a later date. Makes game day and training a breeze.",
    features: [
      "A for attacker, D for defender, T for thrower",
      "Cones",
      "X to mark where the drill starts",
      "Solid line for leads",
      "Broken line for passes",
      "Freehand drawing",
      "Easy undo and redo",
      "Save drills and set plays into folders",
    ],
    price: "$19.99 AUD / year",
    pricingNote:
      "One yearly payment. Full access on any device for 12 months.",
    highlights: [
      "Phone & Tablet",
      "Game Day & Training",
      "Save to Folders",
      "Easy Undo / Redo",
    ],
    icon: "target",
    status: "live",
    audience: "For coaches",
    launchUrl: "/court-planner",
    previewImages: [
      {
        src: "/shop/court-planner/01-cone-drill.jpg",
        alt: "A simple netball drill set up with three cones, a starting cross, a thrower token and movement arrows",
        caption: "Set up a drill in seconds — cones, a starting X, and arrows",
      },
      {
        src: "/shop/court-planner/02-attack-defend-drill.jpg",
        alt: "An attacker-versus-defender drill with multiple A and D player tokens and the ball marked on the court",
        caption: "Run attacker-vs-defender drills with the ball in play",
      },
      {
        src: "/shop/court-planner/03-set-play.jpg",
        alt: "A full set play with both teams positioned on the court — purple Team A and orange Team B",
        caption: "Build a full set play with both teams on the court",
      },
      {
        src: "/shop/court-planner/04-line-options.jpg",
        alt: "The line tool open with options for shape, arrowhead, dotted style, thickness and colour, next to a drill full of cones, arrows and a thrower",
        caption:
          "Pick line shape, arrowhead, dotted style, thickness and colour",
      },
    ],
  },
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
      "Full year of access on one payment",
    ],
    price: "$299 AUD annually",
    pricingNote:
      "One flat payment per year — all drills, every focus area, every new monthly shooting drill included.",
    highlights: [
      "200+ Drills / Skills",
      "New Shooting Drill Monthly",
      "All Focus Areas",
      "Annual Access",
    ],
    icon: "play-circle",
    status: "launching-soon",
    launchDate: "January 2027",
    audience: "For coaches",
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
    status: "live",
    audience: "For clubs & associations",
  },
  {
    slug: "competition-builder",
    name: "Competition Builder",
    short:
      "For messy netball competitions. Unlimited rules, so the quirks that break a spreadsheet draw just become part of the fixture.",
    description:
      "Competition Builder brings clarity to the messy real-world netball draw. Give it your courts, timeslots, teams and start date, and the full season fixture is ready in minutes — grading rounds and byes included. Its point of difference is the unlimited rules engine: write any constraint as a plain sentence and the fixture is built around it, not patched afterwards. It builds the draw with the fewest compromises possible, and surfaces solutions when the scheduling gets complex.",
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
    status: "live",
    audience: "For associations & leagues",
    previewAspect: "4/3",
    previewImages: [
      {
        src: "/shop/competition-builder/01-teams-and-divisions.png",
        alt: "Competition Builder — adding teams and setting up new divisions on the Teams & divisions step",
        caption: "Add every team and set up the divisions that hold them",
      },
      {
        src: "/shop/competition-builder/02-rules.png",
        alt: "Competition Builder — plain-English rules for the fixture, including specific court and timeslot restrictions and bye rounds",
        caption: "Write any constraint in plain English and the draw works around it",
      },
      {
        src: "/shop/competition-builder/03-divisions-filled.png",
        alt: "Competition Builder — teams dragged into three divisions with a live round-cell check at the bottom",
        caption: "Drag teams into divisions with live round-cell checks as you go",
      },
      {
        src: "/shop/competition-builder/04-draw-preflight.png",
        alt: "Competition Builder — pre-flight check before generating the draw showing division sizes, byes and suggested options",
        caption: "Pre-flight check surfaces issues before the fixture is generated",
      },
      {
        src: "/shop/competition-builder/05-draw-generated.png",
        alt: "Competition Builder — generated draw with the headline 'This draw honours every rule — 0 compromises across all 198 games' above the round-by-round fixture",
        caption: "The generated draw with every rule honoured across the full season",
      },
    ],
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
