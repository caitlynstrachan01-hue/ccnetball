export const metadata = {
  title: "Terms & Conditions",
  description: "Terms governing use of CCNetball's website and coaching services.",
};

export default function TermsPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-AU")}
        </p>

        <div className="prose prose-lg mt-10 max-w-none space-y-6 text-foreground/90">
          <p>
            These terms govern your use of <strong>ccnetball.com</strong> and
            CCNetball coaching services delivered by Caitlyn Strachan. By using
            this website or booking a session, you agree to these terms.
          </p>

          <h2 className="font-display text-2xl font-bold tracking-tight">
            Bookings &amp; payment
          </h2>
          <p>
            All bookings are confirmed once payment is received. Pricing for
            individual, group, team, video analysis, online mentoring and
            coach development sessions is listed on the Programs page in AUD
            and is inclusive of GST where applicable.
          </p>

          <h2 className="font-display text-2xl font-bold tracking-tight">
            Cancellations &amp; rescheduling
          </h2>
          <p>
            Sessions cancelled with at least 48 hours notice can be
            rescheduled at no charge. Cancellations within 48 hours may be
            charged at the full session rate. If Caitlyn needs to cancel a
            session, you will be offered a reschedule or a full refund.
          </p>

          <h2 className="font-display text-2xl font-bold tracking-tight">
            Conduct
          </h2>
          <p>
            We provide a safe, positive training environment. Behaviour that
            is disrespectful, unsafe, or disruptive to other athletes may
            result in your session being ended without refund.
          </p>

          <h2 className="font-display text-2xl font-bold tracking-tight">
            Photography &amp; media
          </h2>
          <p>
            Photos and video taken during sessions may occasionally be used
            for marketing on our website and social channels. If you or your
            athlete prefers not to be photographed, let us know in writing
            before your session and we will exclude you.
          </p>

          <h2 className="font-display text-2xl font-bold tracking-tight">
            Liability
          </h2>
          <p>
            Netball coaching involves physical activity. By participating you
            confirm you are physically able to take part. CCNetball is not
            liable for injuries sustained during sessions except where caused
            by our negligence. You are responsible for disclosing any medical
            conditions before training.
          </p>

          <h2 className="font-display text-2xl font-bold tracking-tight">
            Intellectual property
          </h2>
          <p>
            All content on ccnetball.com, including written material, drills,
            programs, photography and the CCNetball brand, is the property
            of CCNetball. You may share links freely; please don&apos;t copy
            content without permission.
          </p>

          <h2 className="font-display text-2xl font-bold tracking-tight">
            Governing law
          </h2>
          <p>
            These terms are governed by the laws of Australia.
          </p>

          <h2 className="font-display text-2xl font-bold tracking-tight">
            Contact
          </h2>
          <p>
            Questions? Email{" "}
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
