import Link from "next/link";
import { Mail } from "lucide-react";
import { SITE } from "@/lib/site-content";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.16c3.2 0 3.58.012 4.85.07 1.17.054 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.058 1.27.07 1.65.07 4.85s-.012 3.58-.07 4.85c-.054 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.058-1.65.07-4.85.07s-3.58-.012-4.85-.07c-1.17-.054-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23C2.172 15.58 2.16 15.2 2.16 12s.012-3.58.07-4.85c.054-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.172 8.8 2.16 12 2.16M12 0C8.74 0 8.33.014 7.05.072 5.78.13 4.9.333 4.14.63a5.93 5.93 0 0 0-2.14 1.39A5.93 5.93 0 0 0 .63 4.16C.333 4.92.13 5.8.072 7.07.014 8.35 0 8.76 0 12.01s.014 3.66.072 4.94c.058 1.27.26 2.15.558 2.92.31.78.72 1.45 1.39 2.13.68.68 1.35 1.09 2.13 1.39.77.3 1.65.5 2.92.56C8.34 23.99 8.75 24 12 24s3.66-.014 4.94-.072c1.27-.058 2.15-.26 2.92-.558.78-.31 1.45-.72 2.13-1.39.68-.68 1.09-1.35 1.39-2.13.3-.77.5-1.65.56-2.92.058-1.28.072-1.69.072-4.94s-.014-3.66-.072-4.94c-.058-1.27-.26-2.15-.558-2.92a5.93 5.93 0 0 0-1.39-2.13A5.93 5.93 0 0 0 19.86.63C19.1.333 18.22.13 16.95.072 15.67.014 15.26 0 12.01 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4 lg:px-10">
        <div className="md:col-span-2">
          <Link
            href="/"
            className="font-display text-2xl font-extrabold tracking-tight"
          >
            <span className="text-[color:var(--brand-coral)]">CC</span>
            <span>Netball</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Netball coaching with Caitlyn Strachan. Former Australian Diamond,
            three-time premiership winner, currently completing her elite
            coaching accreditation.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex size-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-primary"
            >
              <InstagramIcon className="size-5" />
            </a>
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex size-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-primary"
            >
              <FacebookIcon className="size-5" />
            </a>
            <a
              href={`mailto:${SITE.email}`}
              aria-label="Email"
              className="flex size-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-primary"
            >
              <Mail className="size-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
            Coaching
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/programs" className="hover:text-primary">Programs</Link></li>
            <li><Link href="/book" className="hover:text-primary">Book a Session</Link></li>
            <li><Link href="/programs#video-analysis" className="hover:text-primary">Video Analysis</Link></li>
            <li><Link href="/programs#online" className="hover:text-primary">Online Mentoring</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
            Company
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/about" className="hover:text-primary">About Caitlyn</Link></li>
            <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-white/50 md:flex-row lg:px-10">
          <p>© {new Date().getFullYear()} CCNetball. All rights reserved.</p>
          <p>Coaching netball talent across Australia.</p>
        </div>
      </div>
    </footer>
  );
}
