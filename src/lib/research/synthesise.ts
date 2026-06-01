import Groq from "groq-sdk";
import type { TavilyResult } from "./tavily";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const noData = "No data available";

export interface Report {
  overview: string;
  website_signals: string;
  hiring_signals: string;
  linkedin_signals: string;
  recent_news: Array<{
    title: string;
    source: string;
    date: string;
    summary: string;
    url: string;
  }>;
  twitter_signals: string;
  key_intelligence: string[];
  strategic_summary: string;
}

const emptyReport = (): Report => ({
  overview: noData,
  website_signals: noData,
  hiring_signals: noData,
  linkedin_signals: noData,
  recent_news: [],
  twitter_signals: noData,
  key_intelligence: [],
  strategic_summary: noData,
});

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
    key_intelligence: Array.isArray(parsed.key_intelligence) ? parsed.key_intelligence : [],
    strategic_summary: withFallback(parsed.strategic_summary),
  };
}

export async function synthesiseReport(
  companyName: string,
  websiteContent: string,
  changelogContent: string,
  googleResults: TavilyResult[],
  twitterResults: TavilyResult[],
  linkedInResults: TavilyResult[],
  hiringResults: TavilyResult[],
): Promise<Report> {
  try {
    const prompt = `You are a strict competitive intelligence analyst. 
Your only job is to extract and report what is 
explicitly present in the data below.

STRICT RULES:
- Only use information explicitly present in the 
  provided data sources
- If a field has no supporting data write exactly: 
  "No data available"
- Never infer, assume, speculate, or hallucinate
- Never use phrases like "likely", "probably", 
  "appears to", "seems to", "may be"
- Never fabricate news, hires, funding, or features
- Every statement must be traceable to a specific 
  source below
- If a source is empty do not reference it
- Do not repeat the same information across fields

COMPANY: ${companyName}

SOURCE 1 — WEBSITE:
${websiteContent}

SOURCE 2 — CHANGELOG/RELEASES:
${changelogContent}
If empty: ignore this source entirely.

SOURCE 3 — LINKEDIN & COMPANY PROFILE:
${JSON.stringify(linkedInResults.map((result) => ({
  title: result.title,
  content: result.content,
  url: result.url,
})))}
If empty array: set linkedin_signals to "No data available"

SOURCE 5 — WEB SEARCH RESULTS:
${JSON.stringify(googleResults.map((result) => ({
  title: result.title,
  content: result.content,
  date: result.published_date,
  url: result.url,
})))}
If empty array: ignore this source entirely.

SOURCE 6 — TWITTER/X MENTIONS:
${JSON.stringify(twitterResults.map((result) => ({
  title: result.title,
  content: result.content,
  url: result.url,
})))}
If empty array: ignore this source entirely.

SOURCE 7 — HIRING & JOB POSTINGS:
${JSON.stringify(hiringResults.map((result) => ({
  title: result.title,
  content: result.content,
  url: result.url,
})))}
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

Return only valid JSON. No markdown. No preamble. 
No explanation. No text after closing brace.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return emptyReport();

    return parseReport(content);
  } catch (error) {
    console.error("Report synthesis failed:", error);
    return emptyReport();
  }
}
