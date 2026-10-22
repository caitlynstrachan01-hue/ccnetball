import Link from "next/link";

export const metadata = { title: "Terms & Conditions" };

const EMAIL = "info.ccnetball@gmail.com";
const SITE_DISPLAY = "ccnetball.com";
const SITE_URL = "https://www.ccnetball.com";

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">
      {children}
    </h2>
  );
}

export default function TermsPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: 22 October 2026
        </p>

        <div className="prose prose-lg mt-10 max-w-none text-foreground/90">
          <H2>1. Welcome</H2>
          <p>
            Thanks for choosing CC Netball. These terms explain how bookings
            work and what you and your athlete can expect from us, so there
            are no surprises.
          </p>
          <p>
            CC Netball is run by Caitlyn Strachan, trading as CC Netball (ABN
            41 126 397 102), based in South East Queensland. In these terms,
            &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; mean CC
            Netball.
          </p>
          <p>
            These terms cover every CC Netball service: one-on-one sessions,
            small group and team training, clinics, regional workshops, coach
            the coaches workshops, online mentoring, video analysis and our
            online products. By making a booking or buying a product,
            you&apos;re agreeing to these terms. They replace all earlier
            terms issued under the Coach Caitlyn name.
          </p>

          <H2>2. Key words</H2>
          <ul>
            <li>
              <strong>Athlete:</strong> The person taking part in a session,
              clinic or workshop
            </li>
            <li>
              <strong>Parent or guardian:</strong> The adult who books for an
              athlete under 18 and is responsible for them
            </li>
            <li>
              <strong>Organisation:</strong> A school, club or association
              that books on behalf of its athletes or coaches
            </li>
            <li>
              <strong>Session:</strong> Any coaching service we deliver, in
              person or online
            </li>
            <li>
              <strong>Clinic:</strong> A group coaching day or workshop,
              including regional workshops
            </li>
            <li>
              <strong>Materials:</strong> Our drills, videos, programs,
              handouts, apps and other content
            </li>
            <li>
              <strong>Website:</strong> ccnetball.com and its booking pages
            </li>
          </ul>

          <H2>3. Bookings and eligibility</H2>
          <p>
            Athletes under 18 must be booked by a parent or guardian, or by
            their school, club or association. The adult or organisation
            making the booking agrees to these terms on the athlete&apos;s
            behalf.
          </p>
          <p>
            When you book, we&apos;ll ask for the athlete&apos;s details,
            age, club, medical and injury history, allergies and an emergency
            contact. Please make sure it&apos;s accurate, and let us know
            straight away if anything changes, especially a new injury or
            health condition.
          </p>
          <p>
            A booking is confirmed once payment has been received. If a
            booking form is incomplete, we may need to follow up before we
            can confirm your spot.
          </p>

          <H2>4. Fees and payment</H2>
          <p>
            Current prices are listed on the Programs and Shop pages of our
            website. All prices are in Australian dollars and include GST
            where it applies.
          </p>
          <p>
            Full payment is due at the time of booking unless we&apos;ve
            agreed otherwise in writing, for example an invoice for a club
            or association. Prices can change, but a change never affects a
            booking you&apos;ve already paid for.
          </p>
          <p>
            Our online subscriptions, such as the Netball Drills Library,
            roll over monthly. You can cancel any time from your account,
            and you&apos;ll keep access until the end of the month
            you&apos;ve paid for.
          </p>

          <H2>5. Cancellations, refunds and changes</H2>
          <p>Life happens, so here&apos;s how we handle changes on both sides.</p>
          <ul>
            <li>
              <strong>
                You cancel a session 48 hours or more before it starts:
              </strong>{" "}
              Free reschedule
            </li>
            <li>
              <strong>You cancel a session less than 48 hours before:</strong>{" "}
              Full session fee may be charged
            </li>
            <li>
              <strong>You cancel a clinic 7 days or more before:</strong>{" "}
              Full refund, or transfer to another clinic
            </li>
            <li>
              <strong>You cancel a clinic less than 7 days before:</strong>{" "}
              No refund, but you can transfer your place to another athlete
            </li>
            <li>
              <strong>
                Athlete is sick or injured, with a medical certificate:
              </strong>{" "}
              Credit towards a future session or clinic
            </li>
            <li>
              <strong>
                We cancel or postpone, including for weather or safety:
              </strong>{" "}
              Your choice of a reschedule or a full refund
            </li>
          </ul>
          <p>
            We&apos;ll always try to run sessions at the time, date and
            place you booked. Sometimes we need to change the venue, time or
            format for safety or weather reasons, and we&apos;ll let you
            know as early as we can.
          </p>
          <p>
            Nothing in this section takes away your rights under the
            Australian Consumer Law, including a refund if a service has a
            major problem.
          </p>

          <H2>6. Health, safety and injury</H2>
          <p>
            Netball is a physical sport, and like any sport it carries some
            risk of injury. We plan every session with the athlete&apos;s
            age, stage and load in mind, and we&apos;ll always put their
            safety first.
          </p>
          <p>To help us keep everyone safe:</p>
          <ul>
            <li>
              Tell us about any medical condition, injury, allergy or
              medication before the session
            </li>
            <li>
              Check with a doctor or physio first if you&apos;re unsure
              whether your athlete is ready to train
            </li>
            <li>
              Keep your athlete home if they&apos;re unwell, and let us know
              so we can arrange a credit
            </li>
            <li>
              Send them with a water bottle, suitable shoes and any
              medication they may need, such as an asthma puffer or EpiPen
            </li>
          </ul>
          <p>
            If an athlete is hurt or unwell during a session, we&apos;ll
            give first aid, contact you straight away and call emergency
            services if needed. We may ask an athlete to sit out if we think
            continuing isn&apos;t safe.
          </p>
          <p>
            For online sessions, the parent or guardian is responsible for
            making sure the training space at home is clear and safe.
          </p>

          <H2>7. Child safety</H2>
          <p>
            Every athlete deserves to feel safe, respected and supported,
            and we take that responsibility seriously. We follow the Netball
            Australia Safeguarding Children and Young People Policy.
          </p>
          <p>Our commitments to you:</p>
          <ul>
            <li>
              Caitlyn and every CC Netball coach hold a current Queensland
              Blue Card, or the Working With Children Check for the state
              we&apos;re coaching in
            </li>
            <li>Parents and guardians are welcome to watch any in-person session</li>
            <li>
              We communicate about bookings and progress with parents and
              guardians, not privately with athletes
            </li>
            <li>
              Online sessions for under-18s are booked through a parent or
              guardian, who&apos;s welcome to be present
            </li>
            <li>
              Physical contact is limited to what&apos;s needed for safety,
              first aid or demonstrating technique, and we&apos;ll explain
              it first
            </li>
          </ul>
          <p>
            If you have a concern about the safety or wellbeing of any child
            at a CC Netball session, please tell Caitlyn directly or email{" "}
            <a href={`mailto:${EMAIL}`} className="text-primary">
              {EMAIL}
            </a>
            . You can also contact Netball Queensland or, if a child is in
            immediate danger, call 000.
          </p>

          <H2>8. Behaviour</H2>
          <p>
            We keep our sessions positive, respectful and focused on
            learning. We ask athletes to:
          </p>
          <ul>
            <li>Treat coaches, teammates and venue staff with respect</li>
            <li>Follow safety instructions</li>
            <li>Give their best effort and support others to do the same</li>
          </ul>
          <p>
            We ask parents and spectators to cheer on every athlete, leave
            the coaching to the coach during the session, and chat with
            Caitlyn afterwards about any questions.
          </p>
          <p>
            If behaviour is unsafe or repeatedly disrespectful, we&apos;ll
            talk with the athlete and their parent first. If it continues,
            we may end that athlete&apos;s session without a refund.
          </p>

          <H2>9. Photos and video</H2>
          <p>
            We love sharing the work athletes put in, but only with your
            permission. When you book, you can tick a box to say whether we
            can take photos and video of your athlete. If you don&apos;t
            tick it, we won&apos;t use any image where your athlete can be
            identified.
          </p>
          <p>
            If you say yes, we may use photos and video in our coaching
            materials, on our website and on our social media. We&apos;ll
            never publish an athlete&apos;s full name, school or other
            identifying details alongside their image without asking you
            first.
          </p>
          <p>
            You can change your mind any time by emailing{" "}
            <a href={`mailto:${EMAIL}`} className="text-primary">
              {EMAIL}
            </a>
            . We&apos;ll stop using new images straight away and remove
            existing ones from our own website and social media where we
            reasonably can.
          </p>
          <p>
            We sometimes film athletes privately for coaching feedback, such
            as video analysis. That footage is only shared with the athlete
            and their parent or guardian.
          </p>

          <H2>10. Privacy</H2>
          <p>
            We only collect the information we need to run safe, useful
            sessions, such as contact details, the athlete&apos;s age and
            club, and their medical history. We keep medical information
            confidential and only share it with coaches running the session
            or with emergency services if needed.
          </p>
          <p>
            We use trusted providers to run our booking and payment systems,
            and we never sell your information. Our{" "}
            <Link href="/privacy" className="text-primary">
              Privacy Policy
            </Link>{" "}
            explains what we collect, who helps us store it and how you can
            ask to see or correct it.
          </p>

          <H2>11. Our coaching materials</H2>
          <p>
            All CC Netball content is owned by CC Netball. That includes our
            drills, session plans, programs, videos, handouts, workbooks,
            apps, photos, logos and branding. Booking a session or buying a
            product gives you personal use only. It doesn&apos;t give you
            ownership of any of it.
          </p>
          <p>
            You must not copy, recreate, adapt, film, record, share, sell or
            publish any CC Netball content without our written permission.
            This includes running our drills or programs in your own paid
            sessions, clinics or coaching materials, and sharing account
            logins. If we find our content being used without permission,
            we&apos;ll ask for it to be removed and may take further action.
          </p>
          <p>You&apos;re welcome to share links to our website and social media.</p>

          <H2>12. Liability and your rights</H2>
          <p>
            Our services come with guarantees under the Australian Consumer
            Law that can&apos;t be excluded, and nothing in these terms
            takes those rights away. We&apos;ll deliver every session with
            due care and skill.
          </p>
          <p>To the extent the law allows, we&apos;re not responsible for:</p>
          <ul>
            <li>
              Injuries that come from the normal risks of playing netball,
              where we&apos;ve taken reasonable care
            </li>
            <li>
              Loss or harm caused by information that wasn&apos;t disclosed
              to us, such as an unreported injury or condition
            </li>
            <li>Lost or damaged personal belongings at a venue</li>
            <li>
              Problems caused by third-party venues, websites or apps we
              link to
            </li>
          </ul>
          <p>
            Where the law lets us limit our liability for a service, our
            liability is limited to supplying the service again or refunding
            what you paid for it. CC Netball holds public liability
            insurance for all coaching activities.
          </p>

          <H2>13. Communication, changes and contact</H2>
          <p>
            We&apos;ll send booking confirmations, reminders and any changes
            to the email address you gave us, so please keep it up to date.
          </p>
          <p>
            We may update these terms from time to time and will post the
            latest version on our website with the date it changed. Any
            change won&apos;t affect a booking you&apos;ve already paid for,
            and if it&apos;s a big change we&apos;ll email you.
          </p>
          <p>
            These terms are governed by the laws of Queensland, Australia.
          </p>
          <p>
            Got a question? We&apos;re always happy to help. Email{" "}
            <a href={`mailto:${EMAIL}`} className="text-primary">
              {EMAIL}
            </a>{" "}
            or use the contact form at{" "}
            <a
              href={SITE_URL}
              className="text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {SITE_DISPLAY}
            </a>
            .
          </p>
          <p>Caitlyn</p>
        </div>
      </div>
    </section>
  );
}
