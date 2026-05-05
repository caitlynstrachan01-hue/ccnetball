import Link from "next/link";
import { Mail } from "lucide-react";
import { SITE } from "@/lib/site-content";
import { InstagramIcon, FacebookIcon } from "@/components/social-icons";

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
          <p>
            <a
              href={`mailto:${SITE.email}`}
              className="transition hover:text-[color:var(--brand-coral)]"
            >
              {SITE.email}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
