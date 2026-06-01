export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

type TavilyApiResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
  published_date?: string;
};

async function searchTavily(query: string, body: Record<string, unknown>): Promise<TavilyResult[]> {
  try {
    const apiKey = import.meta.env.VITE_TAVILY_API_KEY ?? "";
    if (!apiKey) return [];

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        ...body,
      }),
    });

    if (!response.ok) return [];

    const data = (await response.json()) as { results?: TavilyApiResult[] };
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

export async function searchGoogle(companyName: string): Promise<TavilyResult[]> {
  return searchTavily(`${companyName} company news funding product launch 2026`, {
    search_depth: "advanced",
    include_answer: false,
    max_results: 8,
    topic: "news",
  });
}

export async function searchTwitter(companyName: string): Promise<TavilyResult[]> {
  return searchTavily(`${companyName} site:twitter.com OR site:x.com announcements`, {
    search_depth: "basic",
    include_answer: false,
    max_results: 5,
  });
}

export async function searchLinkedIn(companyName: string): Promise<TavilyResult[]> {
  return searchTavily(`${companyName} company LinkedIn employees headcount team growth 2026`, {
    search_depth: "advanced",
    include_answer: false,
    max_results: 5,
    topic: "general",
  });
}

export async function searchHiring(companyName: string): Promise<TavilyResult[]> {
  return searchTavily(`${companyName} jobs hiring 2026 site:greenhouse.io OR site:lever.co OR site:linkedin.com/jobs OR site:wellfound.com`, {
    search_depth: "advanced",
    include_answer: false,
    max_results: 5,
    topic: "general",
  });
}
