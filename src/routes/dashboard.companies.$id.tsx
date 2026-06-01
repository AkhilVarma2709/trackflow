import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Check, ExternalLink, FileText, Loader2, RefreshCw } from "lucide-react";
import { DashboardShell } from "@/components/trackflow/DashboardShell";
import { GoldOutlineButton } from "@/components/trackflow/Buttons";
import { requireAuth } from "@/lib/supabase";
import { getCompany, getLatestReport, type Company, type LatestReport } from "@/lib/companies";
import { runResearchPipeline } from "@/lib/research/pipeline";
import { useCompanyStatus } from "@/hooks/useResearch";
import { formatReportDate, getKeyIntelligence } from "@/lib/report-utils";

export const Route = createFileRoute("/dashboard/companies/$id")({
  beforeLoad: requireAuth,
  errorComponent: () => <div className="p-10">Error loading report.</div>,
  notFoundComponent: () => <div className="p-10 text-muted-foreground">Company not found.</div>,
  component: CompanyReport,
});

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const researchSteps = [
  "Scraping website...",
  "Fetching news...",
  "Analysing data...",
  "Generating report...",
];

function reportText(value: string | null | undefined) {
  return value?.trim() || "No data available";
}

function ResearchingState({ companyName }: { companyName: string }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveStep((step) => Math.min(step + 1, researchSteps.length - 1));
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <DashboardShell>
      <div className="rounded-xl border border-border bg-card py-20 text-center">
        <h2 className="text-lg font-medium text-charcoal">Getting your report done</h2>
        <p className="mt-1 text-sm text-muted-foreground">Researching {companyName}...</p>
        <ul className="mx-auto mt-8 max-w-md space-y-4 text-left">
          {researchSteps.map((step, index) => {
            const done = index < activeStep;
            const active = index === activeStep;

            return (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span className="h-5 w-5 grid place-items-center">
                  {done && <Check className="h-4 w-4 text-gold" />}
                  {active && <Loader2 className="h-4 w-4 text-gold animate-spin" />}
                  {!done && !active && <span className="h-2 w-2 rounded-full bg-border" />}
                </span>
                <span className={done || active ? "text-charcoal" : "text-muted-foreground"}>{step}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </DashboardShell>
  );
}

function CompanyReport() {
  const { id } = Route.useParams();
  const [c, setCompany] = useState<Company | null>(null);
  const [report, setReport] = useState<LatestReport | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const refreshReportData = useCallback(async () => {
    const [nextCompany, nextReport] = await Promise.all([getCompany(id), getLatestReport(id)]);
    setCompany(nextCompany);
    setReport(nextReport);
  }, [id]);
  const { status } = useCompanyStatus(id, c?.status ?? "idle", () => {
    refreshReportData().catch(() => undefined);
  });
  const currentStatus = c?.status === "researching" ? "researching" : status || c?.status;
  const researching = currentStatus === "researching";

  useEffect(() => {
    let mounted = true;

    refreshReportData()
      .then(() => {
        if (!mounted) return;
      })
      .catch(() => {
        if (!mounted) return;
        setCompany(null);
        setReport(null);
      })
      .finally(() => {
        if (mounted) setLoadingCompany(false);
      });

    return () => {
      mounted = false;
    };
  }, [refreshReportData]);

  useEffect(() => {
    if (currentStatus !== "ready" && currentStatus !== "error") return;

    refreshReportData().catch(() => undefined);
  }, [currentStatus, refreshReportData]);

  if (loadingCompany) {
    return (
      <DashboardShell>
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading report...</div>
      </DashboardShell>
    );
  }

  if (!c) {
    return (
      <DashboardShell>
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Company not found.</div>
      </DashboardShell>
    );
  }

  async function handleRefreshReport() {
    if (!c) return;

    setRefreshing(true);
    setCompany({ ...c, status: "researching" });

    try {
      await runResearchPipeline(c.id, c.name, c.website_url, c.linkedin_url || "");
      await refreshReportData();
    } finally {
      setRefreshing(false);
    }
  }

  const recentNews = Array.isArray(report?.recent_news) ? report.recent_news : [];
  const keyIntelligence = report ? getKeyIntelligence(report) : [];

  if (researching) {
    return <ResearchingState companyName={c.name} />;
  }

  if (currentStatus === "error") {
    return (
      <DashboardShell>
        <div className="rounded-xl border border-border bg-card py-20 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gold-soft grid place-items-center">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <h2 className="mt-5 text-lg font-medium text-charcoal">Research failed.</h2>
          <p className="mt-1 text-sm text-muted-foreground">We couldn't analyse this company. This may be due to a website that blocks scrapers or an API issue.</p>
          <div className="mt-5 flex justify-center">
            <GoldOutlineButton onClick={handleRefreshReport}>
              Try Again
            </GoldOutlineButton>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-charcoal">
        <ArrowLeft className="h-4 w-4" /> {c.name}
      </Link>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="mt-5 flex flex-col gap-5 rounded-xl border border-border bg-card p-4 sm:p-6 lg:flex-row lg:items-start lg:justify-between lg:gap-6"
      >
        <div className="flex min-w-0 items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gold-soft text-sm font-medium text-gold sm:h-14 sm:w-14">{getInitials(c.name)}</div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-medium text-charcoal">{c.name}</h1>
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-gold-soft text-gold px-2.5 py-0.5 text-xs">{c.industry}</span>
              <a href={c.website_url} className="inline-flex min-w-0 items-center gap-1 text-sm text-muted-foreground hover:text-charcoal">
                {c.website_url} <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-sm text-muted-foreground">Last updated: {c.last_researched_at ? formatReportDate(c.last_researched_at) : "Never researched"}</span>
            </div>
          </div>
        </div>
        <GoldOutlineButton onClick={handleRefreshReport} className="w-full sm:w-auto" disabled={researching || refreshing}>
          {researching || refreshing ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1.5" />
          )}
          {researching || refreshing ? "Researching..." : "Refresh Report"}
        </GoldOutlineButton>
      </motion.div>

      {/* Sections */}
      {!report && c.status === "idle" ? (
        <div className="mt-6 rounded-xl border border-border bg-card py-20 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gold-soft grid place-items-center">
            <FileText className="h-5 w-5 text-gold" />
          </div>
          <h2 className="mt-5 text-lg font-medium text-charcoal">No report generated yet.</h2>
          <p className="mt-1 text-sm text-muted-foreground">Click Refresh Report to analyse this company.</p>
          <div className="mt-5 flex justify-center">
            <GoldOutlineButton onClick={handleRefreshReport}>
              Generate First Report
            </GoldOutlineButton>
          </div>
        </div>
      ) : report ? (
        <div className="mt-6 space-y-4">
          <Section label="Overview">
            <p className="text-charcoal leading-relaxed">{reportText(report.overview)}</p>
          </Section>

          <Section label="Website Signals">
            <p className="text-charcoal leading-relaxed">{reportText(report.website_signals)}</p>
          </Section>

          <Section label="Hiring Signals">
            <p className="text-charcoal leading-relaxed">{reportText(report.hiring_signals)}</p>
          </Section>

          <Section label="LinkedIn Signals">
            <p className="text-charcoal leading-relaxed">{reportText(report.linkedin_signals)}</p>
          </Section>

          <Section label="Twitter / X Signals">
            <p className="text-charcoal leading-relaxed">{reportText(report.twitter_signals)}</p>
          </Section>

          <Section label="Recent News">
            {recentNews.length > 0 ? (
              <div className="space-y-4">
                {recentNews.map((item) => {
                  const news = item as { title?: string; source?: string; date?: string; summary?: string; description?: string; url?: string };
                  return (
                    <div key={`${news.title}-${news.date}`} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                      <span className="mt-0.5 inline-flex w-fit items-center rounded-full bg-gold-soft px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold">{news.source}</span>
                      <div>
                        {news.url ? (
                          <a href={news.url} className="text-charcoal text-sm font-medium hover:underline" target="_blank" rel="noreferrer">{news.title}</a>
                        ) : (
                          <div className="text-charcoal text-sm font-medium">{news.title}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-0.5">{news.date}</div>
                        <p className="text-sm text-muted-foreground mt-1">{reportText(news.summary ?? news.description)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-charcoal leading-relaxed">No data available</p>
            )}
          </Section>

          <Section label="Key Intelligence">
            {keyIntelligence.length > 0 ? (
              <ul className="space-y-2.5">
                {keyIntelligence.map((b) => (
                  <li key={String(b)} className="flex items-start gap-3 text-sm text-charcoal">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                    <span>{String(b)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-charcoal leading-relaxed">No data available</p>
            )}
          </Section>

          <Section label="Strategic Summary">
            <p className="text-charcoal leading-relaxed">{reportText(report.strategic_summary)}</p>
          </Section>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No report generated yet. Click Refresh Report to start.
        </div>
      )}
    </DashboardShell>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border bg-card p-4 sm:p-6"
    >
      <div className="text-xs uppercase tracking-widest text-gold">{label}</div>
      <div className="mt-3">{children}</div>
    </motion.div>
  );
}
