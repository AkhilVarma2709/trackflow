import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Building2, FileText, Users, Rocket, DollarSign, Sparkles, Star } from "lucide-react";
import { useEffect } from "react";
import { PrimaryLink, GoldOutlineLink } from "@/components/trackflow/Buttons";
import { redirectIfAuthenticated } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  beforeLoad: redirectIfAuthenticated,
  component: Landing,
});

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function Landing() {
  const navigate = useNavigate();
  const { loading, session } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, navigate, session]);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="text-lg font-medium tracking-tight text-charcoal">
            Track<span className="text-gold">Flow</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-charcoal">Features</a>
            <a href="#about" className="hover:text-charcoal">About</a>
          </nav>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link to="/login" className="text-sm text-charcoal hover:text-charcoal/70">Login</Link>
            <PrimaryLink to="/signup" className="px-3 py-2 sm:px-5 sm:py-2.5">Get Started</PrimaryLink>
          </div>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="mx-auto max-w-4xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pt-20 lg:pt-24"
      >
        <h1 className="text-4xl font-medium leading-[1.08] text-charcoal sm:text-5xl md:text-6xl">
          Know what your competitors are doing.
          <br />
          <span className="text-muted-foreground">Before they do it to you.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:mt-6 sm:text-lg">
          Add any company. TrackFlow researches it across 6 sources automatically — website, changelog,
          hiring, LinkedIn, web search, and Twitter. Get a structured intelligence report in 90 seconds.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <PrimaryLink to="/signup">Get Started Free</PrimaryLink>
          <GoldOutlineLink to="/signup">See How It Works</GoldOutlineLink>
        </div>
        <a
          href="https://github.com/AkhilVarma2709/trackflow"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
        >
          <Star className="h-3.5 w-3.5" />
          Star on GitHub
        </a>
      </motion.section>

      {/* Browser mockup */}
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
        className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-24"
      >
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-secondary/50">
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <div className="mx-auto truncate px-3 text-xs text-muted-foreground">app.trackflow.io/dashboard</div>
          </div>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-8">
            {["Companies Tracked", "Signals This Week", "Reports Generated"].map((label, i) => (
              <div key={label} className="rounded-lg border border-border p-5">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="mt-2 text-2xl text-charcoal font-medium">{[4, 23, 4][i]}</div>
              </div>
            ))}
            <div className="rounded-lg border border-border divide-y divide-border sm:col-span-3">
              {["NovaTech", "PeakLabs", "Aster AI"].map((n) => (
                <div key={n} className="flex items-center justify-between gap-3 px-4 py-3 text-sm sm:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded bg-gold-soft text-[10px] font-medium text-gold">{n.slice(0,2).toUpperCase()}</div>
                    <span className="text-charcoal">{n}</span>
                  </div>
                  <span className="shrink-0 text-sm text-gold">View</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features */}
      <Section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24" >
        <div id="features" className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-medium text-charcoal sm:text-3xl md:text-4xl">Everything you need to stay ahead</h2>
          <p className="mt-3 text-muted-foreground">Six tools that turn scattered signals into clear strategy.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:mt-14">
          {[
            { icon: Building2, title: "Track Any Company", desc: "Add any competitor or company you want to monitor. Just paste their website URL and TrackFlow handles the rest." },
            { icon: FileText, title: "AI Intelligence Reports", desc: "Get a structured report covering website signals, hiring moves, news coverage, LinkedIn presence, and Twitter activity." },
            { icon: Users, title: "Hiring Signals", desc: "See exactly what roles a company is hiring for and what it reveals about their strategic priorities." },
            { icon: Rocket, title: "Product & Changelog Signals", desc: "TrackFlow scrapes changelog and release pages to surface new features and product direction changes." },
            { icon: DollarSign, title: "News & Web Intelligence", desc: "Tavily searches the web in real time for funding announcements, partnerships, press coverage, and strategic moves." },
            { icon: Sparkles, title: "Strict Anti-Hallucination", desc: "Every insight is sourced and cited. If data isn't available TrackFlow says so — it never fills gaps with guesses." },
          ].map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <f.icon className="h-5 w-5 text-gold" />
              <h3 className="mt-4 text-base font-medium text-charcoal">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-medium text-charcoal sm:text-3xl md:text-4xl">How it works</h2>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-3 lg:mt-14 lg:gap-10">
          {[
            { n: 1, title: "Add a Company", desc: "Enter the company name, website URL, and LinkedIn URL. TrackFlow starts researching immediately." },
            { n: 2, title: "6 Sources Researched", desc: "Website, changelog, careers page, LinkedIn, web search, and Twitter — all scraped and searched in parallel." },
            { n: 3, title: "Read Your Report", desc: "A structured intelligence report appears in your dashboard in 90 seconds. Refresh anytime." },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto h-10 w-10 rounded-full border border-gold text-gold grid place-items-center text-sm font-medium">{s.n}</div>
              <h3 className="mt-4 text-base font-medium text-charcoal">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Built By */}
      <Section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="text-xs uppercase tracking-widest text-gold">Built By</div>
        <h2 className="mt-3 text-2xl font-medium text-charcoal sm:text-3xl md:text-4xl">Vegesna Naga Venkata Akhil Varma</h2>
        <p className="mt-3 text-muted-foreground">First-year CS student at BITS Pilani via NXTWAVE, Hyderabad</p>
        <div className="mx-auto mt-6 max-w-2xl space-y-4 text-muted-foreground leading-relaxed">
          <p>
            TrackFlow is a solo project built to solve a real problem — founders and operators spending hours
            manually tracking competitors when they should be building.
          </p>
          <p>
            The entire stack was designed, architected, and shipped independently: TanStack Start, Supabase,
            Firecrawl, Tavily, and Groq powering a research pipeline that produces structured intelligence reports
            in under 90 seconds.
          </p>
          <p>
            This is one of several AI systems I build and ship while in college. I work at the intersection of
            systems design and applied AI — designing the architecture first, then building.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://github.com/AkhilVarma2709/trackflow"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-charcoal px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            View GitHub Repository →
          </a>
          <a
            href="https://linkedin.com/in/akhilvarmavegesna"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-gold px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold-soft"
          >
            Connect on LinkedIn →
          </a>
        </div>
      </Section>

      {/* CTA Banner */}
      <Section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <h2 className="text-2xl font-medium text-charcoal sm:text-3xl md:text-4xl">Try TrackFlow Free</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Sign up and generate your first intelligence report in 90 seconds. No credit card required.
        </p>
        <div className="mt-7"><PrimaryLink to="/signup">Get Started Free</PrimaryLink></div>
      </Section>

      {/* Footer */}
      <footer id="about" className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:px-6 md:grid-cols-2 md:gap-10 md:py-14">
          <div>
            <div className="text-charcoal font-medium mb-3">Built By</div>
            <div className="text-lg font-medium tracking-tight text-charcoal">Track<span className="text-gold">Flow</span></div>
            <p className="mt-3 text-muted-foreground">Built by Akhil Varma — CS student, BITS Pilani via NXTWAVE</p>
          </div>
          <div>
            <div className="text-charcoal font-medium mb-3">Links</div>
            <ul className="space-y-2">
              <li><a className="text-muted-foreground hover:text-charcoal" href="https://github.com/AkhilVarma2709/trackflow" target="_blank" rel="noreferrer">GitHub: github.com/AkhilVarma2709/trackflow</a></li>
              <li><a className="text-muted-foreground hover:text-charcoal" href="https://linkedin.com/in/akhilvarmavegesna" target="_blank" rel="noreferrer">LinkedIn: linkedin.com/in/akhilvarmavegesna</a></li>
              <li><a className="text-muted-foreground hover:text-charcoal" href="mailto:akhilvarma270908@gmail.com">Email: akhilvarma270908@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
            <span>© 2026 TrackFlow. Built by Akhil Varma.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
