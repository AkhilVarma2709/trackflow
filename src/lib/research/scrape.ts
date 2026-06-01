function normalizeUrl(websiteUrl: string) {
  if (!websiteUrl) return "";
  return websiteUrl.startsWith("http://") || websiteUrl.startsWith("https://")
    ? websiteUrl
    : `https://${websiteUrl}`;
}

function joinUrl(baseUrl: string, path: string) {
  return new URL(path, baseUrl).toString();
}

async function scrapeUrl(url: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_FIRECRAWL_API_KEY ?? "";
    if (!apiKey) return "";

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
      }),
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

export async function scrapeWebsite(websiteUrl: string): Promise<string> {
  try {
    const baseUrl = normalizeUrl(websiteUrl);
    if (!baseUrl) return "";

    const paths = ["/", "/about", "/pricing", "/blog", "/careers"];
    const pages = await Promise.all(
      paths.map(async (path) => {
        return scrapeUrl(joinUrl(baseUrl, path));
      }),
    );

    return pages.filter(Boolean).join("\n\n--- PAGE BREAK ---\n\n").slice(0, 8000);
  } catch {
    return "";
  }
}

export async function scrapeChangelog(websiteUrl: string): Promise<string> {
  try {
    const baseUrl = normalizeUrl(websiteUrl);
    if (!baseUrl) return "";

    const paths = ["/changelog", "/releases", "/updates", "/whats-new", "/blog/changelog"];
    for (const path of paths) {
      const content = await scrapeUrl(joinUrl(baseUrl, path));
      if (content.trim()) return content.slice(0, 3000);
    }

    return "";
  } catch {
    return "";
  }
}
