export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Privacy
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-AU")}
        </p>

        <div className="prose prose-lg mt-10 max-w-none text-foreground/90">
          <p>
            CCNetball collects only the information you provide directly,
            through booking enquiries, contact forms and email correspondence.
            We use this information to respond to enquiries, schedule sessions
            and provide coaching services.
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            What we collect
          </h2>
          <ul className="list-disc pl-6">
            <li>Name and contact details</li>
            <li>Coaching preferences and goals</li>
            <li>Anonymous usage analytics (page views, traffic sources)</li>
          </ul>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            What we don't do
          </h2>
          <p>
            We never sell your personal information. We never share contact
            details with third parties.
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Contact
          </h2>
          <p>
            Questions about your data? Email{" "}
            <a href="mailto:info.ccnetball@gmail.com" className="text-primary">
              info.ccnetball@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
