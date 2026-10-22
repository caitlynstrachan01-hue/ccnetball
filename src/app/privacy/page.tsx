export const metadata = { title: "Privacy Policy" };

const collected: [string, string][] = [
  ["Parent or guardian details", "Name, email, phone number"],
  ["Athlete details", "Name, age, club or association, playing positions, goals, and session notes or feedback from Caitlyn"],
  ["Health and safety information", "Medical history, past injuries, conditions, recent surgeries, allergies (food, medication, environmental)"],
  ["Emergency contact", "Name and phone number"],
  ["Consents", "Photo and media consent, and acceptance of our Terms and Conditions"],
  ["Booking and payment", "Program booked, session times, payment status. Card details are entered directly with our payment provider and aren't stored by us."],
  ["Feedback and reviews", "Name, email, the session attended, your review, and whether you're happy for it to be shown publicly"],
  ["Enquiries", "Anything you tell us through our contact form, email, phone or social media"],
  ["Website usage", "IP address, device and browser type, pages visited and traffic sources (analytics only with your consent)"],
  ["Photos and video", "Images or footage taken at sessions and clinics, only where consent has been given"],
];

const providers: [string, string][] = [
  ["Vercel", "Hosts our website"],
  ["Resend", "Delivers form submissions and emails from our website"],
  ["Google (Gmail and Google Workspace)", "Our email and document storage"],
  ["Cal.com", "Online booking calendar"],
  ["Stripe", "Processes payments"],
  ["PostHog and Google Analytics", "Website analytics, with your consent"],
  ["Meta (Facebook and Instagram)", "Social media and advertising measurement, with your consent"],
];

const EMAIL = "info.ccnetball@gmail.com";
const SITE_URL = "https://www.ccnetball.com";
const SITE_DISPLAY = "www.ccnetball.com";

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-bold tracking-tight">{children}</h2>;
}

function Table({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border border-border/70">
      <table className="w-full text-left text-sm">
        <thead className="bg-card">
          <tr>
            <th className="px-4 py-3 font-semibold">{head[0]}</th>
            <th className="px-4 py-3 font-semibold">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b]) => (
            <tr key={a} className="border-t border-border/60 align-top">
              <td className="px-4 py-3 font-medium">{a}</td>
              <td className="px-4 py-3 text-muted-foreground">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Privacy</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: 28 September 2026</p>

        <div className="prose prose-lg mt-10 max-w-none text-foreground/90">
          <H2>About us</H2>
          <p>
            CC Netball (CC stands for Coach Caitlyn) is run by Caitlyn Strachan, a sole trader (ABN 41 126 397 102).
            Caitlyn is a former Australian Diamond and three-time ANZ Championship premiership player. In this policy,
            &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;CC Netball&rdquo; mean Caitlyn Strachan trading as CC Netball,
            the person you share your information with.
          </p>
          <p>
            It covers our website at{" "}
            <a href={SITE_URL} className="text-primary" target="_blank" rel="noopener noreferrer">
              {SITE_DISPLAY}
            </a>
            , our booking and registration forms, and all our coaching services: 1-on-1 and small group sessions, team
            training, clinics, regional workshops, coach-the-coach workshops, online mentoring and video game analysis.
          </p>
          <p>
            We handle personal information in line with the Australian Privacy Principles (APPs) in the{" "}
            <em>Privacy Act 1988</em> (Cth). Because most of the athletes we coach are under 18, we hold ourselves to a
            high standard of care with their information.
          </p>
          <p>This policy replaces all earlier privacy policies issued under the Coach Caitlyn name.</p>

          <H2>Personal information we collect</H2>
          <p>We only collect what we need to coach your athlete safely, run our programs and look after your booking.</p>
          <Table head={["Type", "Examples"]} rows={collected} />
          <p>
            Health information is <strong>sensitive information</strong> under the Privacy Act. We only collect it with
            your consent and only because we need it to keep athletes safe during training.
          </p>
          <p>
            You don&apos;t have to give us everything. If you choose not to, we may not be able to accept a booking,
            particularly without emergency contact and health details. You&apos;re welcome to make general enquiries
            without giving your name.
          </p>

          <H2>Children and young people</H2>
          <p>
            Most of our athletes are aged 11 to 16, so a parent or legal guardian completes bookings and registrations on
            their behalf. By submitting a form, you confirm you&apos;re the athlete&apos;s parent or guardian, or are
            otherwise authorised to provide their information.
          </p>
          <p>
            If an athlete under 18 contacts us directly, we&apos;ll ask for a parent or guardian to be involved before we
            collect anything beyond what&apos;s needed to reply.
          </p>
          <p>
            We don&apos;t knowingly sell, rent or use a child&apos;s information for advertising, and we don&apos;t send
            marketing directly to athletes under 18.
          </p>
          <p>
            We&apos;re watching the development of the Children&apos;s Online Privacy Code, which the Office of the
            Australian Information Commissioner (OAIC) must register by 10 December 2026, and will update this policy if
            it applies to us.
          </p>

          <H2>How we collect it</H2>
          <p>We mostly collect information directly from you, when you:</p>
          <ul>
            <li>complete our athlete registration or booking form</li>
            <li>book a session or clinic through our online calendar</li>
            <li>send an enquiry through our contact form, by email, phone or social media</li>
            <li>leave feedback or a review</li>
            <li>attend a session, clinic or workshop (including session notes and, with consent, photos or video)</li>
          </ul>
          <p>
            Sometimes we receive information from others, such as a club or association that books team training or a
            clinic for its athletes. When that happens, we rely on that organisation to have told you and to have your
            permission.
          </p>

          <H2>Why we use it</H2>
          <p>We use personal information to:</p>
          <ul>
            <li>take and confirm bookings, manage schedules and process payments</li>
            <li>plan and deliver coaching that suits each athlete&apos;s age, position and goals</li>
            <li>keep athletes safe, including managing injuries, allergies and medical needs, and contacting someone in an emergency</li>
            <li>reply to enquiries and keep you updated about sessions you&apos;ve booked</li>
            <li>share news about upcoming clinics and programs, if you&apos;ve agreed to hear from us</li>
            <li>improve our website and services</li>
            <li>meet our legal, insurance and safeguarding obligations</li>
          </ul>
          <p>
            We won&apos;t use your information for anything unrelated to these purposes unless you&apos;d reasonably
            expect it, you&apos;ve agreed, or the law requires or allows it.
          </p>

          <H2>Photos, video and reviews</H2>
          <p>
            We only take and use photos or video of an athlete when a parent or guardian has ticked the photo and media
            consent on our registration form. With that consent, images may appear in teaching materials, on our website
            and on our social media.
          </p>
          <p>
            We never publish an athlete&apos;s full name, school or contact details alongside their image, and we
            don&apos;t tag athletes on social media.
          </p>
          <p>Video sent to us for game analysis is used only to prepare that athlete&apos;s analysis and isn&apos;t published.</p>
          <p>Reviews are only shown publicly if you&apos;ve ticked the public display option, and under the display name you choose.</p>
          <p>
            You can withdraw photo, media or review consent at any time by emailing us. We&apos;ll stop using the content
            in new material and remove it from our website and social media accounts, though we can&apos;t recall
            printed material already handed out.
          </p>

          <H2>Who we share it with</H2>
          <p>
            We never sell personal information. We share it only with trusted service providers who help us run CC
            Netball, and only what they need to do their job.
          </p>
          <Table head={["Provider", "What they do for us"]} rows={providers} />
          <p>We may also share information:</p>
          <ul>
            <li>with medical or emergency services if an athlete is injured or unwell</li>
            <li>with our accountant, lawyers or insurers when reasonably necessary</li>
            <li>with a club or association, only where they&apos;ve booked the session and it relates to their athletes</li>
            <li>where the law requires it, or to report a child safety concern to the relevant authority</li>
          </ul>

          <H2>Overseas disclosure</H2>
          <p>
            Some of our service providers store or process data outside Australia, mainly in the United States. Before
            using a provider, we take reasonable steps to make sure it protects personal information to a standard
            similar to the Australian Privacy Principles. By using our services, you acknowledge that your information
            may be handled overseas in this way.
          </p>

          <H2>Website, cookies and analytics</H2>
          <p>When you first visit our website, we ask whether you&apos;d like to allow analytics cookies.</p>
          <ul>
            <li>
              <strong>Essential only:</strong> we use just what&apos;s needed to keep the site working, such as
              remembering your cookie choice.
            </li>
            <li>
              <strong>Accept all:</strong> we also use PostHog, Google Analytics and the Meta Pixel to understand which
              pages are useful and how people find us. These tools may use cookies and collect your IP address, device
              type and pages visited.
            </li>
          </ul>
          <p>
            We don&apos;t turn on analytics or advertising tracking until you choose &ldquo;Accept all&rdquo;. You can
            change your choice at any time by clearing your browser&apos;s site data for our website, and you can block
            cookies in your browser settings.
          </p>

          <H2>Marketing and opting out</H2>
          <p>
            With your permission, we&apos;ll email parents and guardians about upcoming clinics, programs and CC Netball
            news. Every marketing email includes a simple way to unsubscribe, or you can email us to opt out. Opting out
            won&apos;t affect messages about sessions you&apos;ve already booked.
          </p>
          <p>We don&apos;t share your details with other businesses for their marketing.</p>

          <H2>Storage, security and retention</H2>
          <p>
            We store information electronically with the providers listed above, which use encryption and access
            controls. Any paper forms are kept secure and scanned then securely destroyed. Only Caitlyn can access
            athlete information.
          </p>
          <p>We keep information only as long as we need it:</p>
          <ul>
            <li>athlete, booking and health information while the athlete trains with us, then for up to 7 years after their last session for insurance and legal reasons</li>
            <li>payment records for 5 years, as tax law requires</li>
            <li>website analytics in line with each provider&apos;s retention settings</li>
          </ul>
          <p>
            After that, we securely delete or de-identify it. You can ask us to delete information sooner, and we will
            unless we&apos;re legally required to keep it.
          </p>
          <p>
            No online system is completely secure. If a data breach is likely to cause serious harm, we&apos;ll notify
            you and the OAIC as required by the Notifiable Data Breaches scheme.
          </p>

          <H2>Accessing and correcting your information</H2>
          <p>
            You can ask to see the information we hold about you or your child, or ask us to correct it. Just email us.
            We&apos;ll need to confirm your identity first, and we&apos;ll reply within 30 days.
          </p>
          <p>
            There&apos;s no charge to make a request. In rare cases we may charge a reasonable fee to cover the cost of
            providing a large volume of records, and we&apos;ll tell you before we do.
          </p>
          <p>
            We may refuse access in limited situations the law allows, such as where it would affect someone else&apos;s
            privacy or safety. If we do, we&apos;ll explain why in writing.
          </p>

          <H2>Complaints</H2>
          <p>
            If you&apos;re worried about how we&apos;ve handled your information, please email us with as much detail as
            you can. We&apos;ll acknowledge your complaint within 7 days and aim to resolve it within 30 days.
          </p>
          <p>
            If you&apos;re not happy with our response, you can contact the{" "}
            <a href="https://www.oaic.gov.au" className="text-primary" target="_blank" rel="noopener noreferrer">
              Office of the Australian Information Commissioner
            </a>{" "}
            on 1300 363 992.
          </p>
          <p>
            If your concern is about a child&apos;s safety rather than privacy, please contact us straight away and refer
            to our Safeguarding Policy.
          </p>

          <H2>Changes to this policy and contact</H2>
          <p>
            We&apos;ll update this policy when our services, systems or the law change. The latest version will always
            be on our website with the date it was last updated, and we&apos;ll email registered families about any
            significant change.
          </p>
          <p>
            <strong>Contact us about privacy</strong>
            <br />
            Caitlyn Strachan, trading as CC Netball
            <br />
            Email:{" "}
            <a href={`mailto:${EMAIL}`} className="text-primary">
              {EMAIL}
            </a>
            <br />
            Website:{" "}
            <a href={SITE_URL} className="text-primary" target="_blank" rel="noopener noreferrer">
              {SITE_DISPLAY}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
