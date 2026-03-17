import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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

async function fetchReaderText(url: string) {
  const readerUrl = `https://r.jina.ai/${url}`;
  const response = await fetch(readerUrl, {
    headers: DEFAULT_HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Reader fetch failed with status ${response.status}`);
  }

  return response.text();
}

const EXTRACTION_PROMPT = `You are a multilingual job-posting parser. You receive raw text scraped from a job listing page.
The text may be in ANY language (English, Spanish, German, French, Portuguese, etc.).
Preserve the original language of the job posting — do NOT translate.

Extract exactly these fields and return ONLY valid JSON with no markdown fencing:
{
  "jobTitle": "exact job title as written in the posting",
  "companyName": "company or organization name",
  "description": "the full job description including responsibilities, requirements, qualifications, and benefits. Keep the original structure with line breaks. Preserve the original language."
}

REMOVE all of the following noise (regardless of language or platform):
- Navigation menus, headers, footers, breadcrumbs, sidebar widgets
- Login/signup forms, cookie consent banners, GDPR/privacy notices
- "Similar jobs", "People also viewed", "Recommended for you" sections
- Social sharing buttons, "Apply now" / "Save" / "Report" button labels
- Ads, promotional banners, newsletter signup prompts
- Platform metadata labels like "Seniority level", "Employment type", "Job function", "Industries"
- Platform boilerplate from LinkedIn, Indeed, Glassdoor, InfoJobs, StepStone, Xing, etc.
- Applicant counts, posting dates, view counts, language selectors

If you cannot determine a field, set it to null. For description, include as much relevant job content as possible.`;

const MODELS = ["gemini-3.1-flash-lite-preview", "gemini-2.5-flash"] as const;

async function extractWithGemini(rawText: string): Promise<{ jobTitle?: string; companyName?: string; description: string }> {
  const truncated = rawText.slice(0, 30000);
  let lastError: unknown;
  for (const model of MODELS) {
    let response;
    try {
      response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: `${EXTRACTION_PROMPT}\n\n---RAW TEXT---\n${truncated}` }] }],
      });
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
        console.warn(`Model ${model} rate-limited, trying fallback...`);
        continue;
      }
      throw err;
    }

    const text = response.text?.trim() || "";
    const jsonStr = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Gemini response did not contain valid JSON");
      parsed = JSON.parse(jsonMatch[0]);
    }
    return {
      jobTitle: parsed.jobTitle ? String(parsed.jobTitle) : undefined,
      companyName: parsed.companyName ? String(parsed.companyName) : undefined,
      description: typeof parsed.description === "string" ? parsed.description : "",
    };
  }
  throw lastError ?? new Error("All Gemini models exhausted");
}

function extractLdJson(html: string): { jobTitle?: string; companyName?: string; description: string } | null {
  const match = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]);
    if (data["@type"] !== "JobPosting" || !data.description) return null;
    const description = stripHtmlToText(data.description);
    if (description.length < 50) return null;
    return {
      jobTitle: data.title || undefined,
      companyName: data.hiringOrganization?.name || undefined,
      description,
    };
  } catch {
    return null;
  }
}

async function extractJobSource(url: string): Promise<ExtractedJobSource> {
  const parsedUrl = new URL(url);
  const isLinkedIn = parsedUrl.hostname.includes("linkedin.com") && parsedUrl.pathname.includes("/jobs/");
  const sourceType = isLinkedIn ? "linkedin" : "web" as const;
  const errors: string[] = [];

  // ── Strategy 1: Jina Reader → Gemini AI extraction ───────────────────
  try {
    const readerText = await fetchReaderText(url);
    if (readerText && readerText.length >= 50) {
      try {
        const extracted = await extractWithGemini(readerText);
        if (extracted.description && extracted.description.length >= 80) {
          return {
            sourceUrl: url,
            sourceType,
            jobTitle: extracted.jobTitle,
            companyName: extracted.companyName,
            description: extracted.description,
          };
        }
      } catch (err) {
        errors.push(`Gemini (reader): ${err instanceof Error ? err.message : "failed"}`);
      }
    }
  } catch (err) {
    errors.push(`Jina Reader: ${err instanceof Error ? err.message : "failed"}`);
  }

  // ── Strategy 2: Direct HTML fetch ────────────────────────────────────
  let html = "";
  try {
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS,
      cache: "no-store",
    });
    if (response.ok) {
      html = await response.text();
    } else {
      errors.push(`Direct fetch: HTTP ${response.status}`);
    }
  } catch (err) {
    errors.push(`Direct fetch: ${err instanceof Error ? err.message : "failed"}`);
  }

  if (html) {
    // 2a: LD+JSON structured data (works for Ashby, Lever, Greenhouse, etc.)
    const ldJson = extractLdJson(html);
    if (ldJson && ldJson.description.length >= 80) {
      return {
        sourceUrl: url,
        sourceType,
        jobTitle: ldJson.jobTitle,
        companyName: ldJson.companyName,
        description: ldJson.description,
      };
    }

    // 2b: Strip HTML → Gemini AI extraction
    const strippedText = stripHtmlToText(html);
    if (strippedText.length >= 50) {
      try {
        const extracted = await extractWithGemini(strippedText);
        if (extracted.description && extracted.description.length >= 80) {
          return {
            sourceUrl: url,
            sourceType,
            jobTitle: extracted.jobTitle,
            companyName: extracted.companyName,
            description: extracted.description,
          };
        }
      } catch (err) {
        errors.push(`Gemini (html): ${err instanceof Error ? err.message : "failed"}`);
      }
    }
  }

  // ── Strategy 3: Clean URL and retry (strips tracking params) ─────────
  if (isLinkedIn) {
    const cleanUrl = `https://www.linkedin.com${parsedUrl.pathname}`;
    if (cleanUrl !== url) {
      try {
        const cleanReader = await fetchReaderText(cleanUrl);
        if (cleanReader && cleanReader.length >= 50) {
          const extracted = await extractWithGemini(cleanReader);
          if (extracted.description && extracted.description.length >= 80) {
            return {
              sourceUrl: url,
              sourceType,
              jobTitle: extracted.jobTitle,
              companyName: extracted.companyName,
              description: extracted.description,
            };
          }
        }
      } catch {
        // Final fallback failed
      }
    }
  }

  throw new Error(
    `Could not extract job details from this page. Strategies tried: ${errors.join("; ") || "all returned insufficient content"}`
  );
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