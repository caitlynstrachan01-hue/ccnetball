import { PROGRAMS, SITE } from "@/lib/site-content";

export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `https://${SITE.domain}/#caitlyn`,
        name: "Caitlyn Strachan",
        givenName: "Caitlyn",
        familyName: "Strachan",
        alternateName: "Caitlyn Nevins",
        jobTitle: "Netball Coach",
        nationality: "Australian",
        sameAs: [SITE.instagram, SITE.facebook],
        knowsAbout: [
          "Netball",
          "Athlete development",
          "Suncorp Super Netball",
          "Australian Diamonds",
        ],
        award: [
          "Australian Diamonds debut 2017",
          "3x Premiership winner with Melbourne Vixens and Queensland Firebirds",
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": `https://${SITE.domain}/#business`,
        name: SITE.name,
        url: `https://${SITE.domain}`,
        email: SITE.email,
        founder: { "@id": `https://${SITE.domain}/#caitlyn` },
        areaServed: {
          "@type": "Country",
          name: "Australia",
        },
        priceRange: "$60 - $250 AUD",
        sameAs: [SITE.instagram, SITE.facebook],
      },
      ...PROGRAMS.map((program) => ({
        "@type": "Service",
        "@id": `https://${SITE.domain}/programs#${program.id}`,
        name: program.name,
        description: program.description,
        provider: { "@id": `https://${SITE.domain}/#business` },
        areaServed: { "@type": "Country", name: "Australia" },
        offers: {
          "@type": "Offer",
          price: program.price,
          priceCurrency: "AUD",
          availability: "https://schema.org/InStock",
        },
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
