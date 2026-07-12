const TITLE_RE = /<title[^>]*>([^<]*)<\/title>/i;

export async function fetchUrlMetadata(url: string): Promise<{
  title: string | null;
  finalUrl: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BlackletterLab/0.1 (+private research library)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    const finalUrl = response.url || url;
    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok || !contentType.includes("text/html")) {
      return { title: null, finalUrl };
    }

    const html = await response.text();
    const match = html.match(TITLE_RE);
    const title = match?.[1]?.replace(/\s+/g, " ").trim() || null;
    return { title, finalUrl };
  } catch {
    return { title: null, finalUrl: url };
  }
}
