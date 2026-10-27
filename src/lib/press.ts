export type PressItem = {
  id: string;
  source: string;
  date: string;
  tag: string;
  headline: string;
  quote?: string;
  attribution?: string;
  href: string;
  linkLabel: string;
};

export const PRESS_ITEMS: PressItem[] = [
  {
    id: "netball-qld-elite-coach-2026",
    source: "Netball Queensland",
    date: "19 Oct 2026",
    tag: "Coaching",
    headline: "Premiership Firebird Strachan earns Elite Coach Accreditation",
    quote:
      "Caitlyn is an exciting new coaching talent making her way through the pathway.",
    attribution:
      "Roselee Jencke, Head of Talent and Development, Netball Queensland",
    href: "https://qld.netball.com.au/news/premiership-firebird-strachan-earns-elite-coach-accreditation",
    linkLabel: "Read the full article",
  },
  {
    id: "gold-coast-bulletin-somerset-vicki-wilson",
    source: "Gold Coast Bulletin",
    date: "26 Aug 2025",
    tag: "Coaching",
    headline:
      "Meet the stars of the Somerset College Vicki Wilson Cup championship-winning team",
    href: "https://www.goldcoastbulletin.com.au/sport/meet-the-stars-of-the-somerset-college-vicki-wilson-cup-championship-winning-team/news-story/e6ad86226d9459ca9c4bc454e875de31",
    linkLabel: "Read the full article",
  },
  {
    id: "saints-metro-u10s-2025",
    source: "Saints Netball Club (METRO)",
    date: "25 Aug 2025",
    tag: "Community",
    headline: "Caitlyn visits Saints Netball Club to coach the Under-10s",
    quote:
      "Former Firebirds, Vixens and Australian player Caitlyn Nevins getting our Saints 10 girls firing for the first week of finals.",
    attribution: "Saints Netball Club (METRO)",
    href: "https://www.facebook.com/saintsnetballcoorparoo/posts/former-firebirds-vixens-and-australian-player-caitlyn-nevins-getting-our-saints-/1388517906712746/",
    linkLabel: "See the post on Facebook",
  },
  {
    id: "saints-metro-u9s-2025",
    source: "Saints Netball Club (METRO)",
    date: "25 Aug 2025",
    tag: "Community",
    headline:
      "Caitlyn joins the Saints Under-9s on the sidelines ahead of finals",
    quote:
      "Caitlyn Strachan also joined our Saints 9 team on the sidelines on Saturday to give the girls some valuable feedback during and after the game.",
    attribution: "Saints Netball Club (METRO)",
    href: "https://www.facebook.com/saintsnetballcoorparoo/posts/caitlyn-nevins-also-joined-our-saints-9-team-on-the-sidelines-on-saturday-to-giv/1388555376708999/",
    linkLabel: "See the post on Facebook",
  },
  {
    id: "somerset-qissn-2025",
    source: "Somerset College",
    date: "9 Jul 2025",
    tag: "Coaching · Byline",
    headline: "QISSN success for Somerset College Netball",
    quote:
      "Somerset began the carnival in spectacular fashion, going undefeated through the pool rounds. Accurate finishing under pressure saw Somerset regain control and finish strongly to clinch the QISSN title.",
    attribution: "Caitlyn Nevins, Head Coach of Netball, Somerset College",
    href: "https://www.somerset.qld.edu.au/news/qissn-success-for-somerset-college-netball",
    linkLabel: "Read the full article",
  },
  {
    id: "firebirds-quiet-achiever-2025",
    source: "Queensland Firebirds",
    date: "14 May 2025",
    tag: "Transition",
    headline: "Quiet achiever Strachan relishing new netball role",
    quote: "Stepping out of my comfort zone sparked something.",
    attribution: "Caitlyn Strachan",
    href: "https://firebirds.net.au/news/quiet-achiever-strachan-relishing-new-netball-role",
    linkLabel: "Read the full article",
  },
  {
    id: "guardian-retiring-2019",
    source: "The Guardian",
    date: "14 Aug 2019",
    tag: "Playing career",
    headline:
      "Retiring Caitlyn Nevins proves hard work pays dividends in netball",
    href: "https://www.theguardian.com/sport/2019/aug/14/retiring-caitlyn-nevins-proves-hard-work-pays-dividends-in-netball",
    linkLabel: "Read the full article",
  },
  {
    id: "firebirds-fb-farewell-2019",
    source: "Queensland Firebirds",
    date: "2019",
    tag: "Playing career",
    headline:
      "Firebirds farewell Caitlyn Nevins ahead of her final home game",
    quote:
      "Caity has just announced she will play her final game for the Firebirds in Round 14.",
    attribution: "Queensland Firebirds",
    href: "https://www.facebook.com/watch/?v=362498791309104",
    linkLabel: "Watch on Facebook",
  },
  {
    id: "bendigo-advertiser-country-roots-2019",
    source: "Bendigo Advertiser",
    date: "5 Apr 2019",
    tag: "Playing career",
    headline:
      "Queensland Firebirds star Caitlyn Nevins proud of her country roots",
    quote:
      "You look at the Australian Diamonds, nearly half of the squad are from country areas, so we breed them tough in the country.",
    attribution: "Caitlyn Nevins · Bendigo Advertiser",
    href: "https://www.bendigoadvertiser.com.au/story/5997059/super-netball-star-nevins-proud-of-country-roots/",
    linkLabel: "Read the full article",
  },
  {
    id: "courier-mail-poster-girl-2018",
    source: "The Courier Mail",
    date: "24 Apr 2018",
    tag: "Playing career",
    headline:
      "“I’m the poster girl for ‘it’s never too late to succeed’”",
    quote: "I’m the poster girl for ‘it’s never too late to succeed’.",
    attribution: "Caitlyn Nevins · The Courier Mail",
    href: "https://www.couriermail.com.au/lifestyle/brisbanenews/im-the-poster-girl-for-its-never-too-late-to-succeed/news-story/879724be35f605cf81f9a16604b1b7b6",
    linkLabel: "Read the full article",
  },
  {
    id: "daily-telegraph-diamonds-debut-2017",
    source: "The Daily Telegraph",
    date: "29 Jan 2017",
    tag: "Diamonds debut",
    headline:
      "Caitlyn Nevins becomes the 171st netballer to represent the Diamonds",
    quote:
      "Caitlyn Nevins became just the 171st netballer in history to represent the Australian Diamonds, debuting in the Quad Series win over the Silver Ferns.",
    attribution: "The Daily Telegraph",
    href: "https://www.dailytelegraph.com.au/sport/womens-sport/caitlyn-nevins-171st-netballer-to-represent-diamonds-in-quad-series-win-over-silver-ferns/news-story/45f78c35c771d899ad60bbd3ccff9fb1",
    linkLabel: "Read the full article",
  },
  {
    id: "smh-happy-ending-firebirds-2015",
    source: "The Sydney Morning Herald",
    date: "7 May 2015",
    tag: "Playing career",
    headline:
      "Caitlyn Nevins seeking happy ending with Queensland Firebirds after tough decision to leave Melbourne Vixens",
    href: "https://www.smh.com.au/sport/netball/caitlyn-nevins-seeking-happy-ending-with-queensland-firebirds-after-tough-decision-to-leave-melbourne-vixens-20150507-ggvzw4.html",
    linkLabel: "Read the full article",
  },
  {
    id: "international-netball-festival-ig",
    source: "@internationalnetballfestival (Instagram)",
    date: "29 Jul",
    tag: "Appearance",
    headline: "Caitlyn featured at the International Netball Festival",
    href: "https://www.instagram.com/p/DbZkRckjOu9/",
    linkLabel: "See the post on Instagram",
  },
];

export const PRESS_LOGOS = [
  "The Guardian",
  "Sydney Morning Herald",
  "The Daily Telegraph",
  "The Courier Mail",
  "Netball Queensland",
  "Queensland Firebirds",
];
