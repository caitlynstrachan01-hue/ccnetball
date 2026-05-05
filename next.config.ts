import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old Wix booking service pages
      { source: "/service-page/1on1-or-2on1-training", destination: "/programs#1on1", permanent: true },
      { source: "/service-page/small-group-training-3-6-athletes", destination: "/programs#small-group", permanent: true },
      { source: "/service-page/team-training-max-12-athletes", destination: "/programs#team", permanent: true },
      { source: "/service-page/video-game-analysis", destination: "/programs#video-analysis", permanent: true },
      { source: "/service-page/online-training-mentoring", destination: "/programs#online", permanent: true },
      // Old Wix blog post URLs (Wix uses /post/<slug>)
      { source: "/post/mahalia-cassidy-one-of-the-fittest-players-in-suncorp-super-netball", destination: "/blog/mahalia-cassidy-fittest-player", permanent: true },
      { source: "/post/recovery-nutrition-101", destination: "/blog/recovery-nutrition-101", permanent: true },
      { source: "/post/the-rise-of-reilley-batcheldor", destination: "/blog/rise-of-reilley-batcheldor", permanent: true },
      { source: "/post/laura-clemesha-role-of-a-goal-keeper-and-how-to-combat-a-tall-shooter", destination: "/blog", permanent: true },
      { source: "/blog/laura-clemesha-goal-keeper", destination: "/blog", permanent: true },
      { source: "/blog/coming-back-from-an-acl-injury", destination: "/blog", permanent: true },
      { source: "/post/the-biggest-behavioural-change-that-led-to-my-selection-in-high-performance-programs", destination: "/blog/behavioural-change-high-performance", permanent: true },
      { source: "/post/your-start-does-not-determine-how-you-are-going-to-finish", destination: "/blog/your-start-does-not-determine-your-finish", permanent: true },
      { source: "/post/the-craft-of-a-goal-keeper", destination: "/blog/craft-of-a-goal-keeper", permanent: true },
      { source: "/post/netball-recovery-from-a-sports-physio-perspective", destination: "/blog/netball-recovery-physio", permanent: true },
      // Old Wix navigation pages
      { source: "/book-online", destination: "/book", permanent: true },
      { source: "/courses", destination: "/programs", permanent: true },
      { source: "/webinars", destination: "/programs", permanent: true },
      { source: "/plans-pricing", destination: "/programs", permanent: true },
      { source: "/testamonials-1", destination: "/#testimonials", permanent: true },
      { source: "/testimonials", destination: "/#testimonials", permanent: true },
      { source: "/terms-and-conditions", destination: "/terms", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
    ];
  },
};

export default nextConfig;
