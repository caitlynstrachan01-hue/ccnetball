export const SITE = {
  name: "CCNetball",
  tagline: "Netball coaching with Caitlyn Strachan",
  domain: "ccnetball.com",
  email: "hello@ccnetball.com",
  instagram: "https://instagram.com/coach_caitlyn",
  facebook: "https://facebook.com/caitlynstrachan4",
};

export const CREDENTIALS = [
  { label: "Australian Diamond", detail: "Debut vs Silver Ferns, Jan 2017" },
  { label: "3× Premiership Winner", detail: "Melbourne Vixens, Queensland Firebirds" },
  { label: "Elite Coaching Accreditation", detail: "Currently completing" },
  { label: "Coached Across Australia", detail: "Junior to open grade" },
];

export const PROOF_TEAMS = [
  "Australian Diamonds",
  "Melbourne Vixens",
  "Queensland Firebirds",
  "Suncorp Super Netball",
  "Australian Netball Championship",
];

export const RESULTS = [
  {
    value: "3",
    suffix: "×",
    label: "Premierships won",
    detail: "Vixens & Firebirds",
  },
  {
    value: "100",
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
  },
  {
    id: "online",
    name: "Online Mentoring",
    short: "1-on-1 mentoring from anywhere in Australia.",
    description:
      "Live online sessions covering technique, tactics, and the mental side. Programming, accountability, and direct feedback from a Diamond. No travel required.",
    price: 120,
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
    price: 180,
    unit: "AUD per session",
    durationMinutes: 60,
    capacity: "1 to 4 coaches",
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
