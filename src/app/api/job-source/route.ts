import { NextResponse } from "next/server";

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

type ExtractedJobSource = {
  sourceUrl: string;
  sourceType: "linkedin" | "web";
  jobTitle?: string;
  companyName?: string;
  description: string;
};

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtmlToText(html: string) {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function normalizeDescription(text: string) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\*\*/g, "")
    .replace(/(Description\s*&\s*Requirements)(?=[A-Z])/g, "$1\n")
    .replace(/(Qualifications)(?=\s*\*)/g, "$1\n")
    .replace(/(Nice To Have)(?=\s*\*)/g, "$1\n")
    .replace(/(About [A-Z][A-Za-z &()'.-]+)(?=[A-Z])/g, "$1\n")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^=+$/gm, "")
    .replace(/^-{2,}$/gm, "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line, index, list) => {
      if (!line) return false;
      if (line.length < 2) return false;
      if (/^Title:|^URL Source:|^Markdown Content:/i.test(line)) return false;
      if (/^Skip to main content$/i.test(line)) return false;
      if (/^(LinkedIn|Jobs|People|Learning|Apply|Save|Show|or)$/i.test(line)) return false;
      if (/^(Sign in|Join now|Email or phone|Password)$/i.test(line)) return false;
      if (/^By clicking Continue/i.test(line)) return false;
      if (/^(Similar jobs|People also viewed|Similar Searches|Explore top content on LinkedIn)$/i.test(line)) return false;
      if (/^(Referrals increase your chances|Get notified about new .* jobs)/i.test(line)) return false;
      if (/^(Show more|Show less|Show more jobs like this|Show fewer jobs like this)$/i.test(line)) return false;
      if (/^(Seniority level|Employment type|Job function|Industries)$/i.test(line)) return false;
      if (/^LinkedIn©\s*\d{4}/i.test(line)) return false;
      if (/^\[.*\]\(.*\)$/i.test(line)) return false;
      if (/^!\[.*\]\(.*\)$/i.test(line)) return false;
      if (/^\*\s*###/i.test(line)) return false;
      if (index > 0 && list[index - 1] === line) return false;
      return true;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchReaderText(url: string) {
  const readerUrl = `https://r.jina.ai/http://${url}`;
  const response = await fetch(readerUrl, {
    headers: DEFAULT_HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Reader fetch failed with status ${response.status}`);
  }

  return response.text();
}

function extractFromLinkedInReader(rawText: string, sourceUrl: string): ExtractedJobSource {
  const pageTitle = rawText.match(/^Title:\s*(.+?)\s*\|\s*LinkedIn$/m)?.[1]?.trim();
  const parsedFromTitle = pageTitle?.match(/^(.*?) hiring (.*?) in /);
  const headingTitle = rawText.match(/^###\s+(.+)$/m)?.[1]?.trim();
  const companyHeading = rawText.match(/^####\s+\[(.*?)\]/m)?.[1]?.trim();

  let contentStart = rawText.indexOf("Markdown Content:");
  if (contentStart >= 0) {
    contentStart += "Markdown Content:".length;
  } else {
    contentStart = 0;
  }

  const content = rawText.slice(contentStart);
  const focusedBlock =
    content.match(
      /(\*\*Description\s*&\s*Requirements\*\*[\s\S]*?)(?=Similar jobs|People also viewed|Similar Searches|Explore top content on LinkedIn|LinkedIn©\s*\d{4}|$)/i
    )?.[1] || content;

  const cleaned = normalizeDescription(focusedBlock);

  return {
    sourceUrl,
    sourceType: "linkedin",
    companyName: parsedFromTitle?.[1]?.trim() || companyHeading,
    jobTitle: parsedFromTitle?.[2]?.trim() || headingTitle,
    description: cleaned,
  };
}

function extractFromHtml(html: string, sourceUrl: string, sourceType: "linkedin" | "web"): ExtractedJobSource {
  const title =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();

  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    stripHtmlToText(html).slice(0, 12000);

  return {
    sourceUrl,
    sourceType,
    jobTitle: title ? decodeHtmlEntities(title).replace(/\s*\|.*$/, "").trim() : undefined,
    description: normalizeDescription(decodeHtmlEntities(description)),
  };
}

async function extractJobSource(url: string): Promise<ExtractedJobSource> {
  const parsedUrl = new URL(url);
  const isLinkedIn = parsedUrl.hostname.includes("linkedin.com") && parsedUrl.pathname.includes("/jobs/");

  if (isLinkedIn) {
    try {
      const readerText = await fetchReaderText(url);
      const extracted = extractFromLinkedInReader(readerText, url);
      if (extracted.description.length >= 200) {
        return extracted;
      }
    } catch {
      // Fall back to direct fetch below.
    }
  }

  const response = await fetch(url, {
    headers: DEFAULT_HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page (${response.status})`);
  }

  const html = await response.text();
  const extracted = extractFromHtml(html, url, isLinkedIn ? "linkedin" : "web");

  if (isLinkedIn && extracted.description.length < 200) {
    const readerText = await fetchReaderText(url);
    return extractFromLinkedInReader(readerText, url);
  }

  return extracted;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body as { url?: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "A valid URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Only http and https URLs are supported" }, { status: 400 });
    }

    const extracted = await extractJobSource(parsedUrl.toString());

    if (!extracted.description || extracted.description.length < 80) {
      return NextResponse.json(
        { error: "The page was fetched, but there was not enough job content to use" },
        { status: 422 }
      );
    }

    return NextResponse.json(extracted);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch source URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}