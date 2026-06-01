import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Activity, FileText, Plus, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/trackflow/DashboardShell";
import { GoldOutlineButton } from "@/components/trackflow/Buttons";
import { AddCompanyModal } from "@/components/trackflow/AddCompanyModal";
import { requireAuth } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteCompany,
  getCompanies,
  getRecentReports,
  getReportCounts,
  type Company,
  type Report,
} from "@/lib/companies";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { runResearchPipeline } from "@/lib/research/pipeline";
import { useCompanyStatus } from "@/hooks/useResearch";
import { deriveSignalCategory, formatRelativeTime, getKeyIntelligence } from "@/lib/report-utils";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: requireAuth,
  component: DashboardPage,
});

const categoryStyle: Record<string, string> = {
  Product: "bg-gold-soft text-gold",
  Funding: "bg-gold-soft text-gold",
  Leadership: "bg-gold-soft text-gold",
  Hiring: "bg-gold-soft text-gold",
  Intelligence: "bg-gold-soft text-gold",
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

function CompanyStatusSignal({
  company,
  onRetry,
  onSettled,
}: {
  company: Company;
  onRetry: (company: Company) => void;
  onSettled?: () => void;
}) {
  const { status, latestSignal } = useCompanyStatus(company.id, company.status, onSettled);
  const nextStatus = status || company.status;
  const nextSignal = latestSignal ?? company.latest_signal;

  if (nextStatus === "researching") {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
        <span className="text-gold italic">Researching...</span>
      </span>
    );
  }

  if (nextStatus === "ready") {
    const signal = nextSignal ?? "—";
    return (
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#22C55E" }} />
        <span>{signal.length > 60 ? `${signal.slice(0, 60)}...` : signal}</span>
      </span>
    );
  }

  if (nextStatus === "error") {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#EF4444" }} />
        <span className="text-destructive">Research failed</span>
        <button onClick={() => onRetry(company)} className="text-gold hover:underline">
          Retry
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
      <span>—</span>
    </span>
  );
}

function DashboardPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname.startsWith("/dashboard/companies/")) {
    return <Outlet />;
  }

  return <DashboardOverview />;
}

function DashboardOverview() {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [error, setError] = useState("");
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({ weeklyReports: 0, totalReports: 0 });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const { user } = useAuth();

  const loadDashboard = useCallback(async (options: { showLoading?: boolean } = {}) => {
    if (!user?.id) return;

    setError("");
    if (options.showLoading ?? true) {
      setLoadingCompanies(true);
    }

    try {
      const [nextCompanies, nextStats, nextRecentReports] = await Promise.all([
        getCompanies(user.id),
        getReportCounts(user.id),
        getRecentReports(user.id, 5),
      ]);
      setCompanies(nextCompanies);
      setStats(nextStats);
      setRecentReports(nextRecentReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dashboard data.");
    } finally {
      setLoadingCompanies(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboard({ showLoading: true });
  }, [loadDashboard]);

  useEffect(() => {
    if (!companies.some((company) => company.status === "researching")) return;

    const intervalId = setInterval(() => loadDashboard({ showLoading: false }), 3000);
    return () => clearInterval(intervalId);
  }, [companies, loadDashboard]);

  const handleResearchSettled = useCallback(() => {
    loadDashboard({ showLoading: false });
  }, [loadDashboard]);

  async function handleDeleteCompany() {
    if (!companyToDelete) return;

    setDeleting(true);
    try {
      await deleteCompany(companyToDelete.id);
      setCompanyToDelete(null);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove company.");
    } finally {
      setDeleting(false);
    }
  }

  function handleRetryCompany(company: Company) {
    runResearchPipeline(company.id, company.name, company.website_url, company.linkedin_url || "")
      .then(() => loadDashboard({ showLoading: false }))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not run research.");
      });
    setTimeout(() => loadDashboard({ showLoading: false }), 500);
  }

  return (
    <DashboardShell title="Dashboard" subtitle="Your competitive intelligence overview.">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Companies Tracked", value: companies.length, icon: Building2 },
          { label: "Signals This Week", value: stats.weeklyReports, icon: Activity },
          { label: "Reports Generated", value: stats.totalReports, icon: FileText },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-gold" />
            </div>
            <div className="mt-3 text-3xl font-medium text-charcoal">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Companies */}
        <div className="min-w-0 xl:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-medium text-charcoal">Tracked Companies</h2>
            <GoldOutlineButton onClick={() => setOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-1.5" /> Add Company
            </GoldOutlineButton>
          </div>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

          {loadingCompanies ? (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-4">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-10 animate-pulse rounded bg-secondary" />
                ))}
              </div>
            </div>
          ) : companies.length === 0 ? (
            <div className="rounded-xl border border-border bg-card py-20 text-center">
              <p className="text-sm text-muted-foreground">No companies tracked yet. Add your first company.</p>
              <div className="mt-5 flex justify-center">
                <GoldOutlineButton onClick={() => setOpen(true)}>
                  Add Company <Plus className="h-4 w-4 ml-1.5" />
                </GoldOutlineButton>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {companies.map((c) => (
                  <div
                    key={c.id}
                    className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded bg-gold-soft text-[11px] font-medium text-gold">{getInitials(c.name)}</div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-charcoal">{c.name}</div>
                          <div className="mt-1 inline-flex items-center rounded-full bg-gold-soft px-2.5 py-0.5 text-xs text-gold">{c.industry}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setCompanyToDelete(c)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 grid gap-1 text-sm">
                      <div className="text-muted-foreground">Last researched: {formatDate(c.last_researched_at)}</div>
                      <div className="text-muted-foreground">
                        <CompanyStatusSignal
                          company={c}
                          onRetry={handleRetryCompany}
                          onSettled={handleResearchSettled}
                        />
                      </div>
                    </div>
                    <a
                      href={`/dashboard/companies/${c.id}`}
                      className="mt-3 inline-flex text-sm text-gold hover:underline"
                    >
                      View Report →
                    </a>
                 </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                      <th className="px-5 py-3 font-medium">Company</th>
                      <th className="px-5 py-3 font-medium">Industry</th>
                      <th className="px-5 py-3 font-medium">Last Researched</th>
                      <th className="px-5 py-3 font-medium">Latest Signal</th>
                      <th className="px-5 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {companies.map((c) => (
                      <tr key={c.id} className="group hover:bg-secondary/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-gold-soft text-gold grid place-items-center text-[11px] font-medium">{getInitials(c.name)}</div>
                            <span className="text-charcoal">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-full bg-gold-soft text-gold px-2.5 py-0.5 text-xs">{c.industry}</span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{formatDate(c.last_researched_at)}</td>
                        <td className="px-5 py-4 text-muted-foreground">
                          <div className="max-w-[18rem] truncate">
                            <CompanyStatusSignal
                              company={c}
                              onRetry={handleRetryCompany}
                              onSettled={handleResearchSettled}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <a href={`/dashboard/companies/${c.id}`} className="relative z-10 text-gold text-sm hover:underline">
                              View Report →
                            </a>
                            <button
                              onClick={() => setCompanyToDelete(c)}
                              className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Recent Signals */}
        <div>
          <h2 className="text-lg font-medium text-charcoal mb-4">Recent Signals</h2>
          {recentReports.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">No signals yet. Add companies to start tracking.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report, i) => {
                const insight = getKeyIntelligence(report)[0] ?? "No data available";
                const category = deriveSignalCategory(insight);

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${categoryStyle[category] ?? "bg-gold-soft text-gold"}`}>{category}</span>
                    <div className="mt-2 text-sm text-charcoal font-medium">{report.companies?.name ?? "Company"}</div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{insight}</p>
                    <div className="text-xs text-muted-foreground mt-2">{formatRelativeTime(report.created_at)}</div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddCompanyModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => {
          loadDashboard({ showLoading: false });
          setTimeout(() => loadDashboard({ showLoading: false }), 750);
        }}
        userId={user?.id}
      />
      <AlertDialog open={Boolean(companyToDelete)} onOpenChange={(nextOpen) => !nextOpen && setCompanyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {companyToDelete?.name} from tracking?</AlertDialogTitle>
            <AlertDialogDescription>
              This company and its reports will be removed from your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  );
}
