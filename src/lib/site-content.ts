export const SITE = {
  name: "CCNetball",
  tagline: "Elite netball coaching with Caitlyn Strachan",
  domain: "ccnetball.com",
  email: "hello@ccnetball.com",
  instagram: "https://instagram.com/coach_caitlyn",
  facebook: "https://facebook.com/caitlynstrachan4",
};

export const CREDENTIALS = [
  { label: "Australian Diamond", detail: "Debuted vs Silver Ferns, 2017" },
  { label: "3× Premiership Winner", detail: "Vixens & Firebirds" },
  { label: "Elite Coaching Accreditation", detail: "In progress" },
  { label: "Coached Across Australia", detail: "Junior to Open grade" },
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
    short: "Individualised, high-touch coaching tailored to the athlete.",
    description:
      "Custom-built sessions for athletes ready to commit to elite development. Caitlyn personally designs every drill around your game — strengths, gaps, and the next level you're chasing.",
    price: 160,
    unit: "AUD per session",
    durationMinutes: 60,
    capacity: "1–2 athletes",
    bestFor: "Reps, state pathway, premier league players",
  },
  {
    id: "small-group",
    name: "Small Group Training",
    short: "Compete and grow alongside 3–6 athletes at the same level.",
    description:
      "Small-group sessions that combine individual feedback with game-pace decision making. Built for athletes who want serious development with the energy of a competitive group.",
    price: 60,
    unit: "AUD per athlete",
    durationMinutes: 60,
    capacity: "3–6 athletes",
    bestFor: "Friends training together, club athletes",
  },
  {
    id: "team",
    name: "Team Training",
    short: "Strategic team sessions to install systems and plays.",
    description:
      "Whole-team coaching that builds the structures, attacking plays and defensive systems used at the elite level — adapted to your squad. Includes pre-session planning with the head coach.",
    price: 250,
    unit: "AUD per session",
    durationMinutes: 60,
    capacity: "Up to 12 athletes",
    bestFor: "Club teams, school squads, rep programs",
  },
  {
    id: "video-analysis",
    name: "Video Game Analysis",
    short: "Frame-by-frame breakdown of your game footage.",
    description:
      "Send your match film and receive an in-depth video review: movement patterns, positioning, decision-making, error detection and the exact corrections to drill next. The same lens elite coaches use.",
    price: 200,
    unit: "AUD per review",
    durationMinutes: 60,
    capacity: "Per athlete",
    bestFor: "Athletes serious about self-analysis",
  },
  {
    id: "online",
    name: "Online Mentoring",
    short: "1-on-1 mentoring you can plug into from anywhere in Australia.",
    description:
      "Live online sessions covering technical, tactical, and the mental side of the game. Programming, accountability, and expert insight from a Diamond — without the travel.",
    price: 120,
    unit: "AUD per session",
    durationMinutes: 60,
    capacity: "1 athlete",
    bestFor: "Regional athletes, busy schedules",
  },
  {
    id: "coach-the-coaches",
    name: "Coach the Coaches",
    short: "Mentoring for coaches building elite programs.",
    description:
      "Professional development for coaches: session design, drill libraries, athlete management, and the systems that produce premiership-level teams. Tailored to your level and squad.",
    price: 180,
    unit: "AUD per session",
    durationMinutes: 60,
    capacity: "1–4 coaches",
    bestFor: "Club, school and rep coaches",
  },
];

export const TESTIMONIALS = [
  {
    name: "Kelly Statham",
    role: "Chinchilla Netball Association",
    program: "Specialist Team Training",
    quote:
      "Chinchilla Netball Inc had an awesome coaching session with Coach Caitlyn. We've had coaching clinics before, but never anything even close to this standard.",
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
    program: "Small Group Training (5–8yo)",
    quote:
      "Caitlyn is fabulous with kids! She's fun, engaging and tailors her sessions to all levels.",
  },
];
