export const SITE = {
  name: "CCNetball",
  tagline: "Netball coaching with Caitlyn Strachan",
  domain: "ccnetball.com",
  email: "info.ccnetball@gmail.com",
  instagram: "https://instagram.com/ccnetball_",
  facebook: "https://www.facebook.com/caitlynstrachan4/",
  instagramHandle: "@ccnetball_",
  // Cal.com username — placeholder until Caitlyn's Cal.com is set up.
  // Update this once she has a Cal.com account; bookings will route to it automatically.
  calcomUsername: process.env.NEXT_PUBLIC_CALCOM_USERNAME || "ccnetball",
};

export const CREDENTIALS = [
  { label: "Australian Diamond", detail: "Debut vs Silver Ferns, Jan 2017" },
  { label: "3× Premiership Winner", detail: "Melbourne Vixens, Queensland Firebirds" },
  { label: "Elite Coaching Accreditation", detail: "Currently completing" },
  { label: "Coaches throughout Australia", detail: "Based in Brisbane · Junior Age to Open" },
];

export const CAREER = {
  international: {
    name: "Australian Diamonds",
    eyebrow: "International",
    detail: "Debut vs Silver Ferns, Jan 2017",
  },
  clubs: [
    { name: "Melbourne Vixens", years: "2013–2014" },
    { name: "Queensland Firebirds", years: "2015–2019" },
  ],
  competitions: [
    { name: "ANZ Championship", years: "2013–2016" },
    { name: "Suncorp Super Netball", years: "2017–2019" },
  ],
};

/**
 * Full career pathway, top-to-bottom: international down to junior representative.
 * Used on the About page for a deeper view of every level Caitlyn played at.
 */
export const CAREER_PATHWAY = [
  {
    step: "01",
    eyebrow: "International",
    competition: "Australian Diamonds",
    teams: ["Quad Series", "Constellation Cup"],
    detail:
      "Selected to wear the green and gold. Debut against the Silver Ferns, January 2017, becoming the second-oldest player in Diamonds history to debut.",
    tier: "primary" as const,
  },
  {
    step: "02",
    eyebrow: "International · Fast 5",
    competition: "Australian Fast 5",
    teams: ["World Netball Series"],
    detail:
      "Selected for Australia in the Fast 5 format, competing on the world stage at the World Netball Series.",
    tier: "secondary" as const,
  },
  {
    step: "03",
    eyebrow: "Elite domestic",
    competition: "Suncorp Super Netball / ANZ Championship",
    teams: ["Melbourne Vixens", "Queensland Firebirds"],
    detail:
      "Australia's top-flight club competitions. Three premierships across both clubs between 2013 and 2019.",
    tier: "standard" as const,
  },
  {
    step: "04",
    eyebrow: "Sub-elite domestic",
    competition: "Australian Netball League",
    teams: [
      "Victorian Fury · 2008, 2013, 2014",
      "Canberra Darters · 2012",
    ],
    detail:
      "National second-tier competition. The proving ground for athletes pushing into Australia's elite programs.",
    tier: "standard" as const,
  },
  {
    step: "05",
    eyebrow: "Junior representative",
    competition: "National Netball Championships",
    teams: [
      "Victoria 17&U",
      "Victoria 19&U",
      "Victoria 21&U",
    ],
    detail:
      "Junior representative netball at national level, representing Victoria across three age divisions.",
    tier: "standard" as const,
  },
  {
    step: "06",
    eyebrow: "State league",
    competition: "Victorian Netball League",
    teams: ["Southern Saints", "Yarra Valley Grammar Ariels"],
    detail:
      "Victoria's premier state league. Game time, leadership and the cohesion needed before stepping onto the national stage.",
    tier: "standard" as const,
  },
  {
    step: "07",
    eyebrow: "Academy",
    competition: "Northern Zone Academy",
    teams: [],
    detail:
      "Regional development academy. The structured entry point into Victorian state programs and the wider netball pathway.",
    tier: "standard" as const,
  },
  {
    step: "08",
    eyebrow: "Where it started",
    competition: "Echuca & District Netball Association",
    teams: [],
    detail:
      "Junior netball at the local association in Echuca, the regional Victorian club that started everything.",
    tier: "standard" as const,
  },
];

export const RESULTS = [
  {
    value: "3",
    suffix: "×",
    label: "Premierships won",
    detail: "Vixens & Firebirds",
  },
  {
    value: "1000",
    suffix: "+",
    label: "Athletes coached",
    detail: "Across Australia",
  },
  {
    value: "30",
    suffix: " yrs",
    label: "Inside the game",
    detail: "Player and coach",
  },
  {
    value: "5★",
    suffix: "",
    label: "Average rating",
    detail: "From every program",
  },
];

export type Program = {
  id: string;
  name: string;
  short: string;
  description: string;
  price: number;
  unit: string;
  durationMinutes: number;
  capacity: string;
  bestFor: string;
  /** Temporarily hide from public pages and the booking form. */
  hidden?: boolean;
};

export const PROGRAMS: Program[] = [
  {
    id: "1on1",
    name: "1-on-1 / 2-on-1 Training",
    short: "Built around one athlete. Or two.",
    description:
      "A session designed for the player in front of Caitlyn. She maps your strengths, the gaps to close, and the next level you're chasing, then runs every drill against that brief. No filler.",
    price: 160,
    unit: "AUD per session",
    durationMinutes: 60,
    capacity: "1 to 2 athletes",
    bestFor: "Reps, state pathway, premier league players",
  },
  {
    id: "small-group",
    name: "Small Group Training",
    short: "Compete inside a 3 to 6 athlete squad.",
    description:
      "Individual feedback at game pace. Built for athletes who want sharp, personal coaching without losing the energy of training alongside players at the same level.",
    price: 60,
    unit: "AUD per athlete",
    durationMinutes: 60,
    capacity: "3 to 6 athletes",
    bestFor: "Friends training together, club athletes",
  },
  {
    id: "team",
    name: "Team Training",
    short: "Install the structures elite teams use.",
    description:
      "Whole squad coaching covering attacking plays, defensive systems, and the team patterns Caitlyn ran with the Vixens and Firebirds, adapted to your group. Includes pre-session planning with the head coach.",
    price: 250,
    unit: "AUD per session",
    durationMinutes: 60,
    capacity: "Up to 12 athletes",
    bestFor: "Club teams, school squads, rep programs",
  },
  {
    id: "video-analysis",
    name: "Video Game Analysis",
    short: "See what an elite coach sees in your game.",
    description:
      "Send your match footage. Caitlyn returns a frame-by-frame review covering movement patterns, positioning, decision-making, and the exact corrections to drill next. The same lens used inside Suncorp Super Netball.",
    price: 200,
    unit: "AUD per review",
    durationMinutes: 60,
    capacity: "Per athlete",
    bestFor: "Athletes serious about self-analysis",
    hidden: true,
  },
  {
    id: "online",
    name: "Online Mentoring",
    short: "1-on-1 mentoring from anywhere in Australia.",
    description:
      "Live online sessions covering technique, tactics, and the mental side. Programming, accountability, and direct feedback from a Diamond. No travel required.",
    price: 160,
    unit: "AUD per session",
    durationMinutes: 60,
    capacity: "1 athlete",
    bestFor: "Regional athletes, busy schedules",
  },
  {
    id: "coach-the-coaches",
    name: "Coach the Coaches",
    short: "Develop the coach behind the squad.",
    description:
      "Professional development for coaches: session design, drill libraries, athlete management, and the systems behind premiership-winning teams. Tailored to your level and the squad you're building.",
    price: 80,
    unit: "AUD per coach (minimum 4 coaches)",
    durationMinutes: 90,
    capacity: "Minimum 4 coaches",
    bestFor: "Club, school and rep coaches",
  },
];

export const TESTIMONIALS = [
  {
    name: "Kelly Statham",
    role: "Chinchilla Netball Association",
    program: "Specialist Team Training",
    quote:
      "Chinchilla Netball had an awesome coaching session with Caitlyn. We've had coaching clinics before, but never anything close to this standard.",
    featured: true,
  },
  {
    name: "Kerry Nemcansky",
    role: "Parent",
    program: "Small Group Training",
    quote:
      "Caitlyn is a dedicated, skilled, and passionate coach. Her organisation and thoroughness are without comparison.",
  },
  {
    name: "Tiff Bartram",
    role: "Coach",
    program: "Specialist Team Training",
    quote:
      "She is highly motivating and caters for all ability types and age groups, ranging from juniors to open grades.",
  },
  {
    name: "Adrian Arnold",
    role: "Parent",
    program: "1-on-1 Training",
    quote:
      "Caitlyn has helped my daughter to gain better understanding and overcome the challenges that come with being a representative netball player.",
    featured: true,
  },
  {
    name: "Lindy Burke",
    role: "School",
    program: "School Specialist Session",
    quote:
      "Caitlyn watches, listens, assesses, then tailors a training plan to suit the student's playing style and skill level.",
  },
  {
    name: "Saraid Tripp",
    role: "Parent",
    program: "Small Group Training (5 to 8yo)",
    quote:
      "Caitlyn is fabulous with kids. She's fun, engaging and tailors her sessions to all levels.",
  },
];

export const FAQ = [
  {
    q: "Where do sessions run?",
    a: "Across Australia. Caitlyn travels for team and small-group bookings. Online mentoring runs from anywhere in the country.",
  },
  {
    q: "Who is this for?",
    a: "Athletes from junior development through to premier league and state-level players. Plus coaches building serious programs.",
  },
  {
    q: "How quickly can we get started?",
    a: "Most enquiries get a reply within one business day. First session is usually booked within the same week.",
  },
  {
    q: "Do you do team and group rates?",
    a: "Yes. Team training is priced per session, not per athlete. Small group training is per-athlete with bookings of 3 or more.",
  },
];
