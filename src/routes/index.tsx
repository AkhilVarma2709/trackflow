import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Building2, FileText, Users, Rocket, DollarSign, Sparkles, Check } from "lucide-react";
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
            <a href="#pricing" className="hover:text-charcoal">Pricing</a>
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
          Track any company. Get weekly intelligence reports. Stay ahead.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <PrimaryLink to="/signup">Get Started Free</PrimaryLink>
          <GoldOutlineLink to="/signup">See How It Works</GoldOutlineLink>
        </div>
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
                <div className="mt-2 text-2xl text-charcoal font-medium">{[12, 47, 38][i]}</div>
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

      {/* Logos */}
      <Section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">Trusted by fast-moving teams</p>
        <div className="mt-8 grid grid-cols-2 gap-5 opacity-70 sm:grid-cols-3 md:grid-cols-5 md:gap-8">
          {["LATTICE", "VEKTOR", "NORTHWIND", "OPALSKY", "FERRA"].map((l) => (
            <div key={l} className="text-center text-sm tracking-widest text-muted-foreground">{l}</div>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24" >
        <div id="features" className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-medium text-charcoal sm:text-3xl md:text-4xl">Everything you need to stay ahead</h2>
          <p className="mt-3 text-muted-foreground">Six tools that turn scattered signals into clear strategy.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:mt-14">
          {[
            { icon: Building2, title: "Track Companies", desc: "Add unlimited competitors and partners to monitor in one place." },
            { icon: FileText, title: "Weekly Reports", desc: "A digestible summary delivered every Monday morning." },
            { icon: Users, title: "Leadership Moves", desc: "Know when key hires join — or leave — the companies that matter." },
            { icon: Rocket, title: "Product Launch Alerts", desc: "Get notified the moment a competitor ships something new." },
            { icon: DollarSign, title: "Funding Intelligence", desc: "Track rounds, investors, and runway across your market." },
            { icon: Sparkles, title: "AI Summaries", desc: "Strategic takeaways written for product and GTM teams." },
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
            { n: 1, title: "Add Companies", desc: "Paste a URL or pick from our library." },
            { n: 2, title: "Track Signals", desc: "We continuously monitor news, hiring, and product changes." },
            { n: 3, title: "Receive Reports", desc: "Get a clean weekly digest in your inbox and dashboard." },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto h-10 w-10 rounded-full border border-gold text-gold grid place-items-center text-sm font-medium">{s.n}</div>
              <h3 className="mt-4 text-base font-medium text-charcoal">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { q: "TrackFlow has replaced three tools and a weekly intern recap.", a: "Maya Patel", r: "Head of Product, Vektor" },
            { q: "The Monday reports are the first thing my team reads.", a: "Daniel Ross", r: "CEO, Opalsky" },
            { q: "Finally a competitive intelligence tool built for operators.", a: "Sara Lin", r: "VP Marketing, Ferra" },
          ].map((t) => (
            <div key={t.a} className="rounded-xl border border-border bg-card p-6">
              <p className="text-charcoal leading-relaxed">"{t.q}"</p>
              <div className="mt-5 text-sm">
                <div className="text-charcoal">{t.a}</div>
                <div className="text-muted-foreground">{t.r}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div id="pricing" className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-medium text-charcoal sm:text-3xl md:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free. Scale when you need to.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-14">
          {[
            { name: "Starter", price: "$29", period: "/mo", features: ["Up to 5 companies", "Weekly reports", "Email alerts"], cta: "Get Started" },
            { name: "Pro", price: "$79", period: "/mo", features: ["Up to 25 companies", "Daily signals", "AI summaries", "Priority support"], cta: "Get Started", popular: true },
            { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited companies", "Custom integrations", "Dedicated success manager", "SSO + audit logs"], cta: "Contact Sales" },
          ].map((p) => (
            <div key={p.name} className={`rounded-xl bg-card p-7 ${p.popular ? "border-2 border-gold" : "border border-border"}`}>
              {p.popular && <div className="text-xs uppercase tracking-widest text-gold mb-3">Most Popular</div>}
              <div className="text-charcoal font-medium">{p.name}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl text-charcoal font-medium">{p.price}</span>
                <span className="text-muted-foreground text-sm">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-charcoal">
                    <Check className="h-4 w-4 text-gold shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                {p.popular ? <PrimaryLink to="/signup" className="w-full">{p.cta}</PrimaryLink> : <GoldOutlineLink to="/signup" className="w-full">{p.cta}</GoldOutlineLink>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA Banner */}
      <Section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <h2 className="text-2xl font-medium text-charcoal sm:text-3xl md:text-4xl">Start tracking smarter.</h2>
        <div className="mt-7"><PrimaryLink to="/signup">Get Started Free</PrimaryLink></div>
      </Section>

      {/* Footer */}
      <footer id="about" className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:px-6 md:grid-cols-4 md:gap-10 md:py-14">
          <div>
            <div className="text-lg font-medium tracking-tight text-charcoal">Track<span className="text-gold">Flow</span></div>
            <p className="mt-3 text-muted-foreground">Competitive intelligence for fast-moving teams.</p>
          </div>
          {[
            { h: "Product", l: ["Features", "Pricing", "Changelog", "Roadmap"] },
            { h: "Company", l: ["About", "Customers", "Careers", "Contact"] },
            { h: "Resources", l: ["Blog", "Docs", "Privacy", "Terms"] },
          ].map((c) => (
            <div key={c.h}>
              <div className="text-charcoal font-medium mb-3">{c.h}</div>
              <ul className="space-y-2">
                {c.l.map((x) => <li key={x}><a className="text-muted-foreground hover:text-charcoal" href="#">{x}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>© 2025 TrackFlow. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-charcoal">Twitter</a>
              <a href="#" className="hover:text-charcoal">LinkedIn</a>
              <a href="#" className="hover:text-charcoal">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
