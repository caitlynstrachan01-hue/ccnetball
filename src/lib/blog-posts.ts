export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  category: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "mahalia-cassidy-fittest-player",
    title:
      "Mahalia Cassidy: One of the fittest players in Suncorp Super Netball",
    excerpt:
      "An interview with one of the league's hardest-running mid-courters on the work ethic behind her engine.",
    date: "2022-08-12",
    readMinutes: 6,
    category: "Athlete spotlight",
  },
  {
    slug: "recovery-nutrition-101",
    title: "Recovery nutrition 101 for netball athletes",
    excerpt:
      "Practical post-game nutrition advice for developing players — what to eat, when, and why it matters more than supplements.",
    date: "2022-06-18",
    readMinutes: 5,
    category: "Performance",
  },
  {
    slug: "rise-of-reilley-batcheldor",
    title: "The rise of Reilley Batcheldor",
    excerpt:
      "How a junior Diamonds prospect built her game from the ground up — drills, mindset, and the lessons inside her path.",
    date: "2022-02-24",
    readMinutes: 7,
    category: "Athlete spotlight",
  },
  {
    slug: "laura-clemesha-goal-keeper",
    title: "Laura Clemesha: Role of a goal keeper and combating tall shooters",
    excerpt:
      "A masterclass in defensive positioning, body work, and reading the play — from one of Australia's most respected GKs.",
    date: "2022-02-15",
    readMinutes: 8,
    category: "Position",
  },
  {
    slug: "behavioural-change-high-performance",
    title: "The biggest behavioural change that led to my high-performance selection",
    excerpt:
      "A short, honest reflection on the single shift in habits that opened the door to elite programs.",
    date: "2022-02-07",
    readMinutes: 4,
    category: "Mindset",
  },
  {
    slug: "your-start-does-not-determine-your-finish",
    title: "Your start does not determine how you're going to finish",
    excerpt:
      "Notes on long-term player development — for athletes who feel they're behind the pack.",
    date: "2022-01-30",
    readMinutes: 5,
    category: "Mindset",
  },
  {
    slug: "craft-of-a-goal-keeper",
    title: "The craft of a goal keeper",
    excerpt:
      "Footwork, anticipation, body positioning — breaking down the discipline of one of netball's hardest positions.",
    date: "2022-01-23",
    readMinutes: 6,
    category: "Position",
  },
  {
    slug: "netball-recovery-physio",
    title: "Netball recovery: a sports physio's perspective",
    excerpt:
      "What the science says about recovery for netball athletes — and what most clubs still get wrong.",
    date: "2022-01-16",
    readMinutes: 7,
    category: "Performance",
  },
];
