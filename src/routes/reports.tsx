import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "@/components/trackflow/DashboardShell";
import { requireAuth } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getReports, type Report } from "@/lib/companies";
import { formatReportDate, getKeyIntelligence } from "@/lib/report-utils";

export const Route = createFileRoute("/reports")({
  beforeLoad: requireAuth,
  component: ReportsPage,
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

function getSignalsFound(report: Report) {
  return getKeyIntelligence(report).length;
}

function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    if (authLoading) return;
    if (!user?.id) {
      setReports([]);
      setLoading(false);
      return;
    }

    setError("");
    setLoading(true);

    try {
      setReports(await getReports(user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load reports.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, user?.id]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <DashboardShell title="Reports" subtitle="All competitive intelligence reports.">
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="space-y-4">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-10 animate-pulse rounded bg-secondary" />
            ))}
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-20 text-center">
          <p className="text-sm text-muted-foreground">No reports yet. Add companies and generate your first report.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {reports.map((report) => {
              const companyName = report.companies?.name ?? "Company";
              const industry = report.companies?.industry;

              return (
                <a
                  key={report.id}
                  href={`/dashboard/companies/${report.company_id}`}
                  className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded bg-gold-soft text-[11px] font-medium text-gold">{getInitials(companyName)}</div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-charcoal">{companyName}</div>
                        {industry && <div className="mt-1 inline-flex items-center rounded-full bg-gold-soft px-2.5 py-0.5 text-xs text-gold">{industry}</div>}
                        <div className="mt-1 text-xs text-muted-foreground">{formatReportDate(report.created_at)}</div>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm text-gold">View</span>
                  </div>
                  <div className="mt-3 text-sm text-charcoal">Signals found: {getSignalsFound(report)}</div>
                </a>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Report Date</th>
                  <th className="px-5 py-3 font-medium">Signals Found</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map((report) => {
                  const companyName = report.companies?.name ?? "Company";
                  const industry = report.companies?.industry;

                  return (
                    <tr key={report.id} className="hover:bg-secondary/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-gold-soft text-gold grid place-items-center text-[11px] font-medium">{getInitials(companyName)}</div>
                          <span className="text-charcoal">{companyName}</span>
                          {industry && <span className="inline-flex items-center rounded-full bg-gold-soft text-gold px-2.5 py-0.5 text-xs">{industry}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{formatReportDate(report.created_at)}</td>
                      <td className="px-5 py-4 text-charcoal">{getSignalsFound(report)}</td>
                      <td className="px-5 py-4 text-right">
                        <a href={`/dashboard/companies/${report.company_id}`} className="text-gold text-sm hover:underline">
                          View Report →
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
