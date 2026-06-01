import type { Report } from "@/lib/companies";

export function formatReportDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

export function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / 86_400_000));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;

  const weeks = Math.floor(diffDays / 7);
  if (weeks === 1) return "1 week ago";
  return `${weeks} weeks ago`;
}

export function getKeyIntelligence(report: Pick<Report, "key_intelligence">) {
  return Array.isArray(report.key_intelligence) ? report.key_intelligence.map(String) : [];
}

export function deriveSignalCategory(value: string) {
  const lower = value.toLowerCase();

  if (lower.includes("hire") || lower.includes("recruit")) return "Hiring";
  if (lower.includes("fund") || lower.includes("raise") || lower.includes("invest")) return "Funding";
  if (lower.includes("launch") || lower.includes("product") || lower.includes("feature")) return "Product";
  return "Intelligence";
}
