import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Report } from "./synthesise";

type SearchResult = {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
};

const noData = "No data available";

function env(name: string) {
  return (import.meta.env[name] as string | undefined) ?? process.env[name] ?? "";
}

function normalizeUrl(websiteUrl: string) {
  if (!websiteUrl) return "";
  return websiteUrl.startsWith("http://") || websiteUrl.startsWith("https://")
    ? websiteUrl
    : `https://${websiteUrl}`;
}

function joinUrl(baseUrl: string, path: string) {
  return new URL(path, baseUrl).toString();
}

async function scrapeUrl(url: string) {
  try {
    const apiKey = env("VITE_FIRECRAWL_API_KEY");
    if (!apiKey) return "";

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, formats: ["markdown"] }),
    });

    if (!response.ok) return "";
    const result = (await response.json()) as {
      success?: boolean;
      data?: { markdown?: string };
      markdown?: string;
    };

    if (result.success === false) return "";
    return result.data?.markdown ?? result.markdown ?? "";
  } catch {
    return "";
  }
}

async function scrapeWebsite(websiteUrl: string) {
  const baseUrl = normalizeUrl(websiteUrl);
  if (!baseUrl) return "";

  const paths = ["/", "/about", "/pricing", "/blog", "/careers"];
  const pages = await Promise.all(paths.map((path) => scrapeUrl(joinUrl(baseUrl, path))));
  return pages.filter(Boolean).join("\n\n--- PAGE BREAK ---\n\n").slice(0, 6000);
}

async function scrapeChangelog(websiteUrl: string) {
  const baseUrl = normalizeUrl(websiteUrl);
  if (!baseUrl) return "";

  const paths = ["/changelog", "/releases", "/updates", "/whats-new", "/blog/changelog"];
  for (const path of paths) {
    const content = await scrapeUrl(joinUrl(baseUrl, path));
    if (content.trim()) return content.slice(0, 1800);
  }

  return "";
}

function companyMatches(companyName: string, value: string) {
  const normalizedCompany = companyName.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const normalizedValue = value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return normalizedValue.includes(normalizedCompany);
}

async function searchTavily(query: string, body: Record<string, unknown>): Promise<SearchResult[]> {
  try {
    const apiKey = env("VITE_TAVILY_API_KEY");
    if (!apiKey) return [];

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, ...body }),
    });

    if (!response.ok) return [];
    const data = (await response.json()) as {
      results?: Array<{
        title?: string;
        url?: string;
        content?: string;
        score?: number;
        published_date?: string;
      }>;
    };

    return (data.results ?? []).map((result) => ({
      title: result.title ?? "",
      url: result.url ?? "",
      content: result.content ?? "",
      score: result.score ?? 0,
      published_date: result.published_date,
    }));
  } catch {
    return [];
  }
}

function filterSearchResults(companyName: string, results: SearchResult[]) {
  return results
    .filter((result) => companyMatches(companyName, result.title) || companyMatches(companyName, result.url))
    .slice(0, 4);
}

function fallbackReport(): Report {
  return {
    overview: noData,
    website_signals: noData,
    hiring_signals: noData,
    linkedin_signals: noData,
    recent_news: [],
    twitter_signals: noData,
    key_intelligence: [],
    strategic_summary: noData,
  };
}

function compactText(value: string, limit = 900) {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/!\[[^\]]*\]/g, "")
    .replace(/\]\([^)]*\)/g, "")
    .replace(/[#*_`>|~]/g, "")
    .replace(/\s*--- PAGE BREAK ---\s*/g, "\n")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "Tavily web search";
  }
}

function prepareForPrompt(value: string, limit: number) {
  return compactText(value, limit);
}

function prepareSearch(results: SearchResult[], includeDate = true) {
  return results.slice(0, 4).map((result) => ({
    title: result.title,
    content: compactText(result.content, 320),
    ...(includeDate ? { date: result.published_date } : {}),
    url: result.url,
  }));
}

function buildExtractiveReport(
  companyName: string,
  websiteContent: string,
  changelogContent: string,
  googleResults: SearchResult[],
  twitterResults: SearchResult[],
  linkedInResults: SearchResult[],
  hiringResults: SearchResult[],
): Report {
  const newsItems = googleResults
    .slice(0, 5)
    .map((result) => ({
      title: result.title,
      source: getHostname(result.url),
      date: result.published_date ?? "",
      description: result.content,
      summary: result.content,
      url: result.url,
    }))
    .filter((item) => item.title || item.summary);

  const keyIntelligence = [
    websiteContent && `${companyName} website content returned ${websiteContent.length} characters of source data. Source: website.`,
    changelogContent && `Changelog or release content returned ${changelogContent.length} characters of source data. Source: changelog.`,
    newsItems[0] && `Recent external result found: ${newsItems[0].title}. Source: ${newsItems[0].source}.`,
    twitterResults[0] && `Twitter/X result found: ${twitterResults[0].title}. Source: twitter.`,
    linkedInResults[0] && `LinkedIn/company profile result found: ${linkedInResults[0].title}. Source: linkedin search.`,
    hiringResults[0] && `Hiring result found: ${hiringResults[0].title}. Source: hiring search.`,
  ].filter(Boolean).slice(0, 5) as string[];

  return {
    overview: websiteContent
      ? compactText(websiteContent, 700)
      : noData,
    website_signals: [websiteContent && compactText(websiteContent, 700), changelogContent && compactText(changelogContent, 500)]
      .filter(Boolean)
      .join("\n\n") || noData,
    hiring_signals: hiringResults.length > 0
      ? hiringResults.slice(0, 5).map((result) => `${result.title}: ${compactText(result.content, 220)} ${result.url}`.trim()).join("\n")
      : noData,
    linkedin_signals: linkedInResults.length > 0
      ? linkedInResults.slice(0, 5).map((result) => `${result.title}: ${compactText(result.content, 220)} ${result.url}`.trim()).join("\n")
      : noData,
    recent_news: newsItems.slice(0, 5),
    twitter_signals: twitterResults.length > 0
      ? twitterResults.slice(0, 5).map((result) => `${result.title}: ${compactText(result.content, 220)} ${result.url}`.trim()).join("\n")
      : noData,
    key_intelligence: keyIntelligence,
    strategic_summary: keyIntelligence.length > 0
      ? `Research completed with source data from ${[
          websiteContent && "website",
          changelogContent && "changelog/releases",
          linkedInResults.length > 0 && "LinkedIn/company profile search",
          googleResults.length > 0 && "Tavily web search",
          twitterResults.length > 0 && "Twitter/X search",
          hiringResults.length > 0 && "hiring search",
        ].filter(Boolean).join(", ")}. The report above is extractive source content because Groq did not return a usable structured synthesis.`
      : noData,
  };
}

function hasMeaningfulReport(report: Report) {
  return [
    report.overview,
    report.website_signals,
    report.hiring_signals,
    report.linkedin_signals,
    report.twitter_signals,
    report.strategic_summary,
  ].some((value) => value.trim() && value.trim() !== noData) || report.recent_news.length > 0 || report.key_intelligence.length > 0;
}

function withFallback(value: unknown) {
  return typeof value === "string" && value.trim() ? value : noData;
}

function parseReport(content: string): Report {
  const cleaned = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  const json = jsonStart >= 0 && jsonEnd >= 0 ? cleaned.slice(jsonStart, jsonEnd + 1) : cleaned;
  const parsed = JSON.parse(json) as Partial<Report>;

  return {
    overview: withFallback(parsed.overview),
    website_signals: withFallback(parsed.website_signals),
    hiring_signals: withFallback(parsed.hiring_signals),
    linkedin_signals: withFallback(parsed.linkedin_signals),
    recent_news: Array.isArray(parsed.recent_news) ? parsed.recent_news : [],
    twitter_signals: withFallback(parsed.twitter_signals),
    key_intelligence: Array.isArray(parsed.key_intelligence) ? parsed.key_intelligence.map(String) : [],
    strategic_summary: withFallback(parsed.strategic_summary),
  };
}

async function synthesiseReport(
  companyName: string,
  websiteContent: string,
  changelogContent: string,
  googleResults: SearchResult[],
  twitterResults: SearchResult[],
  linkedInResults: SearchResult[],
  hiringResults: SearchResult[],
) {
  const apiKey = env("VITE_GROQ_API_KEY");
  if (!apiKey) {
    console.info("Groq API key missing in server function.");
    return fallbackReport();
  }

  const websiteForPrompt = prepareForPrompt(websiteContent, 3000);
  const changelogForPrompt = prepareForPrompt(changelogContent, 1000);
  const googleForPrompt = prepareSearch(googleResults);
  const twitterForPrompt = prepareSearch(twitterResults, false);
  const linkedInForPrompt = prepareSearch(linkedInResults, false);
  const hiringForPrompt = prepareSearch(hiringResults, false);

  const prompt = `You are a strict competitive intelligence analyst.
Your only job is to extract and report what is explicitly present in the data below.

STRICT RULES:
- Only use information explicitly present in the provided data sources
- If a field has no supporting data write exactly: "No data available"
- Never infer, assume, speculate, or hallucinate
- Never use phrases like "likely", "probably", "appears to", "seems to", "may be"
- Never fabricate news, hires, funding, or features
- Every statement must be traceable to a specific source below
- If a source is empty do not reference it
- Do not repeat the same information across fields

COMPANY: ${companyName}

SOURCE 1 — WEBSITE:
${websiteForPrompt}

SOURCE 2 — CHANGELOG/RELEASES:
${changelogForPrompt}
If empty: ignore this source entirely.

SOURCE 3 — LINKEDIN & COMPANY PROFILE:
${JSON.stringify(linkedInForPrompt)}
If empty array: set linkedin_signals to "No data available"

SOURCE 5 — WEB SEARCH RESULTS:
${JSON.stringify(googleForPrompt)}
If empty array: ignore this source entirely.

SOURCE 6 — TWITTER/X MENTIONS:
${JSON.stringify(twitterForPrompt)}
If empty array: ignore this source entirely.

SOURCE 7 — HIRING & JOB POSTINGS:
${JSON.stringify(hiringForPrompt)}
If empty array: set hiring_signals to "No data available"

Return a JSON object with exactly these fields:

{
  "overview": "2-3 sentences on what they do and who they serve. Source: website only. If no website data: No data available.",
  "website_signals": "Specific features, pricing, positioning, and messaging found on their site. Include any changelog entries found. Cite page sections. If nothing notable: No data available.",
  "hiring_signals": "List specific job titles, departments, and roles found in the hiring search results. For each role or department state what it signals about their current strategic focus. Source: hiring results only. If no hiring data found: No data available.",
  "linkedin_signals": "Employee count, headcount growth, team size, leadership mentions, and company growth signals found in LinkedIn results. Source: LinkedIn results only. If no data found: No data available.",
  "recent_news": [
    {
      "title": "exact title from source",
      "source": "exact source name",
      "date": "exact date",
      "summary": "one sentence — only what the article explicitly states",
      "url": "url if available"
    }
  ],
  "twitter_signals": "Recent announcements, product mentions, and engagement patterns found in Twitter results. Source: Twitter results only. If no Twitter data: No data available.",
  "key_intelligence": [
    "Insight 1 — one sentence, cite source (website/changelog/linkedin/google/twitter/hiring)",
    "Insight 2 — same rules",
    "Insight 3 — same rules",
    "Insight 4 — same rules",
    "Insight 5 — same rules"
  ],
  "strategic_summary": "3-4 sentences summarising what is actually known from the data. State clearly what data was available and what was missing. Do not speculate beyond the data."
}

Return only valid JSON. No markdown. No preamble. No explanation. No text after closing brace.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    console.info("Groq synthesis failed:", {
      status: response.status,
      body: await response.text().catch(() => ""),
    });
    return fallbackReport();
  }
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    console.info("Groq synthesis returned no message content.");
    return fallbackReport();
  }
  return parseReport(content);
}

export const generateResearchReport = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    companyName: z.string().min(1),
    websiteUrl: z.string().min(1),
    linkedInUrl: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const [
      websiteContent,
      changelogContent,
      rawGoogleResults,
      rawTwitterResults,
      rawLinkedInResults,
      rawHiringResults,
    ] = await Promise.all([
      scrapeWebsite(data.websiteUrl),
      scrapeChangelog(data.websiteUrl),
      searchTavily(`"${data.companyName}" official company news funding product launch 2026`, {
        search_depth: "advanced",
        include_answer: false,
        max_results: 8,
        topic: "news",
      }),
      searchTavily(`"${data.companyName}" site:twitter.com OR site:x.com announcements`, {
        search_depth: "basic",
        include_answer: false,
        max_results: 5,
      }),
      searchTavily(`${data.companyName} company LinkedIn employees headcount team growth 2026`, {
        search_depth: "advanced",
        include_answer: false,
        max_results: 5,
        topic: "general",
      }),
      searchTavily(`${data.companyName} jobs hiring 2026 site:greenhouse.io OR site:lever.co OR site:linkedin.com/jobs OR site:wellfound.com`, {
        search_depth: "advanced",
        include_answer: false,
        max_results: 5,
        topic: "general",
      }),
    ]);
    const googleResults = filterSearchResults(data.companyName, rawGoogleResults);
    const twitterResults = filterSearchResults(data.companyName, rawTwitterResults);
    const linkedInResults = filterSearchResults(data.companyName, rawLinkedInResults);
    const hiringResults = filterSearchResults(data.companyName, rawHiringResults);

    const sourceLengths = {
      websiteContent: websiteContent.length,
      changelogContent: changelogContent.length,
      googleResults: googleResults.length,
      twitterResults: twitterResults.length,
      linkedInResults: linkedInResults.length,
      hiringResults: hiringResults.length,
      rawGoogleResults: rawGoogleResults.length,
      rawTwitterResults: rawTwitterResults.length,
      rawLinkedInResults: rawLinkedInResults.length,
      rawHiringResults: rawHiringResults.length,
    };
    console.info("Research source lengths:", sourceLengths);

    const hasSourceData = Object.values(sourceLengths).some((value) => value > 0);
    if (!hasSourceData) {
      throw new Error("No research source data was returned.");
    }

    const report = await synthesiseReport(
      data.companyName,
      websiteContent,
      changelogContent,
      googleResults,
      twitterResults,
      linkedInResults,
      hiringResults,
    );
    const finalReport = hasMeaningfulReport(report)
      ? report
      : buildExtractiveReport(
          data.companyName,
          websiteContent,
          changelogContent,
          googleResults,
          twitterResults,
          linkedInResults,
          hiringResults,
        );

    if (!hasMeaningfulReport(finalReport)) {
      console.info("Research synthesis returned no usable content:", {
        overview: finalReport.overview,
        website_signals: finalReport.website_signals,
        hiring_signals: finalReport.hiring_signals,
        linkedin_signals: finalReport.linkedin_signals,
        twitter_signals: finalReport.twitter_signals,
        recent_news: finalReport.recent_news.length,
        key_intelligence: finalReport.key_intelligence.length,
        strategic_summary: finalReport.strategic_summary,
      });
      throw new Error("Research completed, but report synthesis returned no usable content.");
    }

    return {
      report: finalReport,
      rawData: {
        websiteContent,
        changelogContent,
        googleResults,
        twitterResults,
        linkedInResults,
        hiringResults,
        rawGoogleResults,
        rawTwitterResults,
        rawLinkedInResults,
        rawHiringResults,
        sourceLengths,
      },
    };
  });
