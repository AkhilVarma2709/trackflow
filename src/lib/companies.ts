import { supabase } from "@/lib/supabase";

export type CompanyStatus = "idle" | "researching" | "ready" | "error";

export type Company = {
  id: string;
  user_id: string;
  name: string;
  website_url: string;
  linkedin_url: string | null;
  industry: string | null;
  logo_url: string | null;
  status: CompanyStatus;
  latest_signal: string | null;
  last_researched_at: string | null;
  created_at: string;
};

export type AddCompanyData = {
  name: string;
  website_url: string;
  linkedin_url?: string | null;
  industry?: string | null;
};

export type Report = {
  id: string;
  company_id: string;
  user_id: string;
  overview: string | null;
  recent_news: unknown;
  website_signals: string | null;
  hiring_signals: string | null;
  linkedin_signals: string | null;
  twitter_signals: string | null;
  key_intelligence: unknown;
  strategic_summary: string | null;
  raw_data: unknown;
  created_at: string;
  companies: {
    name: string;
    industry?: string | null;
  } | null;
};

export type LatestReport = Omit<Report, "companies">;

export async function getCompanies(userId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Company[];
}

export async function getCompany(companyId: string) {
  const { data, error } = await supabase.from("companies").select("*").eq("id", companyId).single();

  if (error) throw error;
  return data as Company;
}

export async function addCompany(userId: string, data: AddCompanyData) {
  const { data: company, error } = await supabase
    .from("companies")
    .insert({
      user_id: userId,
      name: data.name,
      website_url: data.website_url,
      linkedin_url: data.linkedin_url || null,
      industry: data.industry || null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return company as Company;
}

export async function deleteCompany(companyId: string) {
  const { error } = await supabase.from("companies").delete().eq("id", companyId);
  if (error) throw error;
}

export async function updateCompanyStatus(companyId: string, status: CompanyStatus) {
  const { data, error } = await supabase
    .from("companies")
    .update({ status })
    .eq("id", companyId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Company;
}

export async function updateLatestSignal(companyId: string, signal: string) {
  const { data, error } = await supabase
    .from("companies")
    .update({ latest_signal: signal })
    .eq("id", companyId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Company;
}

export async function getReportCounts(userId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalReports, weeklyReports] = await Promise.all([
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgo.toISOString()),
  ]);

  if (totalReports.error) throw totalReports.error;
  if (weeklyReports.error) throw weeklyReports.error;

  return {
    totalReports: totalReports.count ?? 0,
    weeklyReports: weeklyReports.count ?? 0,
  };
}

export async function getReports(userId: string) {
  const { data, error } = await supabase
    .from("reports")
    .select("*, companies(name, industry)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Report[];
}

export async function getRecentReports(userId: string, limit = 5) {
  const { data, error } = await supabase
    .from("reports")
    .select("*, companies(name, industry)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Report[];
}

export async function getLatestReport(companyId: string) {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as LatestReport | null;
}
