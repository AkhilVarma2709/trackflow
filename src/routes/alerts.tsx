import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { DashboardShell } from "@/components/trackflow/DashboardShell";
import { requireAuth } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getReports, type Report } from "@/lib/companies";
import { deriveSignalCategory, formatReportDate, getKeyIntelligence } from "@/lib/report-utils";

export const Route = createFileRoute("/alerts")({
  beforeLoad: requireAuth,
  component: AlertsPage,
});

function AlertsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readAlerts, setReadAlerts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;
    setLoading(true);
    setError("");

    getReports(user.id)
      .then((data) => {
        if (mounted) setReports(data);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "Could not load alerts.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const alerts = useMemo(
    () =>
      reports.flatMap((report) =>
        getKeyIntelligence(report).map((description, index) => ({
          id: `${report.id}-${index}`,
          category: deriveSignalCategory(description),
          company: report.companies?.name ?? "Company",
          description,
          date: formatReportDate(report.created_at),
        })),
      ),
    [reports],
  );

  const empty = !loading && alerts.length === 0;

  return (
    <DashboardShell title="Alerts" subtitle="Intelligence delivered as it happens.">
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : empty ? (
        <div className="rounded-xl border border-border bg-card py-20 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gold-soft grid place-items-center">
            <Bell className="h-5 w-5 text-gold" />
          </div>
          <h2 className="mt-5 text-lg font-medium text-charcoal">No alerts yet.</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add companies to start receiving intelligence alerts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-opacity sm:flex-row sm:items-start sm:justify-between sm:p-5 ${readAlerts[a.id] ? "opacity-50" : ""}`}
            >
              <div className="min-w-0">
                <span className="inline-flex items-center rounded-full bg-gold-soft text-gold px-2 py-0.5 text-[10px] uppercase tracking-wider">{a.category}</span>
                <div className="mt-2 text-charcoal font-medium">{a.company}</div>
                <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                <div className="text-xs text-muted-foreground mt-2">{a.date}</div>
              </div>
              <button
                type="button"
                onClick={() => setReadAlerts((current) => ({ ...current, [a.id]: true }))}
                className="shrink-0 text-left text-sm text-gold hover:underline"
              >
                Mark as read
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
