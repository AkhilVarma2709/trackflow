import { generateResearchReport } from "./research.functions";
import { supabase } from "../supabase";

function getHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "Tavily web search";
  }
}

export async function runResearchPipeline(
  companyId: string,
  companyName: string,
  websiteUrl: string,
  linkedInUrl = "",
): Promise<void> {
  try {
    const researchingResult = await supabase
      .from("companies")
      .update({ status: "researching" })
      .eq("id", companyId);

    if (researchingResult.error) throw researchingResult.error;

    const { report, rawData } = await generateResearchReport({
      data: {
        companyName,
        websiteUrl,
        linkedInUrl,
      },
    });
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("No authenticated user found.");
    const googleResults = Array.isArray(rawData.googleResults) ? rawData.googleResults : [];
    const recentNews = report.recent_news.length > 0
      ? report.recent_news
      : googleResults.map((result) => ({
          title: result.title,
          source: getHostname(result.url),
          date: result.published_date || "",
          summary: String(result.content ?? "").slice(0, 200),
          url: result.url,
        }));

    const insertResult = await supabase
      .from("reports")
      .insert({
        company_id: companyId,
        user_id: userId,
        overview: report.overview,
        recent_news: recentNews,
        website_signals: report.website_signals,
        hiring_signals: report.hiring_signals,
        linkedin_signals: report.linkedin_signals,
        twitter_signals: report.twitter_signals,
        key_intelligence: report.key_intelligence,
        strategic_summary: report.strategic_summary,
        raw_data: rawData,
      })
      .select()
      .single();

    if (insertResult.error) throw insertResult.error;

    const latestSignal = report.key_intelligence[0] || null;

    const readyResult = await supabase
      .from("companies")
      .update({
        status: "ready",
        latest_signal: latestSignal,
        last_researched_at: new Date().toISOString(),
      })
      .eq("id", companyId);

    if (readyResult.error) throw readyResult.error;
  } catch (error) {
    const errorResult = await supabase.from("companies").update({ status: "error" }).eq("id", companyId);
    if (errorResult.error) console.error("Failed to set company error status:", errorResult.error);

    console.error("Pipeline failed:", error);
    throw error;
  }
}
