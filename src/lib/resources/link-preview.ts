import { loadBuffer } from "cheerio";
import sharp from "sharp";
import type { ResourceCategory, ResourceKind } from "../../data/resources.ts";
import { normalizeResourceUrl, ResourceError, sourceFromUrl } from "./model.ts";
import { readPublicResource } from "./public-page.ts";
import { xPreview } from "./x-preview.ts";
import { validateUpload } from "./upload.ts";

const topics: { expression: RegExp; tags: string[]; category: ResourceCategory }[] = [
  { expression: /charts?|visuali[sz]ation|diagrams?|statecharts?/i, tags: ["Charts", "Diagrams", "Visualization"], category: "design" },
  { expression: /\b(photos?|photography|images?|illustrations?|icons?|svg)\b/i, tags: ["Images", "Assets"], category: "design" },
  { expression: /\b(figma|design|typography|fonts?)\b/i, tags: ["Design"], category: "design" },
  { expression: /\b(ai|llms?|claude|gemini|chatgpt|agents?)\b/i, tags: ["AI", "Agents"], category: "ai" },
  { expression: /\bskills?\b/i, tags: ["Skills"], category: "ai" },
  { expression: /\b(database|databases|postgres|sql|redis|mongodb)\b/i, tags: ["Database", "DB"], category: "infrastructure" },
  { expression: /\b(hosting|deployment|cloud|serverless)\b/i, tags: ["Hosting", "Infrastructure"], category: "infrastructure" },
  { expression: /\b(react|javascript|typescript|frontend|components?)\b/i, tags: ["Frontend", "Development"], category: "development" },
  { expression: /\b(api|backend|sdk|framework|library|libraries)\b/i, tags: ["API", "Development"], category: "development" },
  { expression: /\b(marketing|seo|advertising|campaigns?|copywriting)\b/i, tags: ["Marketing", "SEO"], category: "marketing" },
  { expression: /\b(audio|music|podcasts?|sound)\b/i, tags: ["Audio"], category: "design" },
  { expression: /\b(videos?|animation|motion)\b/i, tags: ["Video", "Motion"], category: "design" },
];
const clean = (value: string, maximum: number) => value.replace(/\s+/g, " ").trim().slice(0, maximum);

export function pageDetails(bytes: Buffer, input: string) {
  const url = normalizeResourceUrl(input); const $ = loadBuffer(bytes);
  const metadata = new Map<string, string>();
  $("meta").each((_index, node) => {
    const key = ($(node).attr("property") || $(node).attr("name") || "").toLowerCase();
    if (!metadata.has(key)) metadata.set(key, $(node).attr("content") || "");
  });
  const name = clean(metadata.get("og:title") || metadata.get("twitter:title") || $("title").first().text() || $("h1").first().text() || new URL(url).hostname, 160);
  $("script,style,nav,footer,noscript").remove();
  const main = $("main,article").first(); const content = main.length ? main : $("body");
  const description = clean(metadata.get("og:description") || metadata.get("description") || metadata.get("twitter:description") || content.find("p").filter((_index, node) => $(node).text().trim().length > 35).first().text(), 600);
  const headline = `${name} ${description}`; const text = `${headline} ${clean(content.text(), 10_000)}`;
  const matches = topics.filter(({ expression }) => expression.test(text));
  const category = topics.find(({ expression }) => expression.test(headline))?.category || matches[0]?.category || "ideas";
  const keywords = (metadata.get("keywords") || "").split(/[,;]+/).map((tag) => clean(tag, 40)).filter(Boolean);
  const tags = [...new Set([...keywords, ...matches.flatMap((item) => item.tags)])].slice(0, 12);
  const type = metadata.get("og:type") || "";
  const kind: ResourceKind = /^(video|music)/i.test(type) ? (type.startsWith("music") ? "audio" : "video") : type === "article" ? "article" : /\b(library|framework)\b/i.test(headline) || new URL(url).hostname === "github.com" ? "library" : "tool";
  let image = "";
  try { const candidate = metadata.get("og:image") || metadata.get("twitter:image"); if (candidate) image = normalizeResourceUrl(new URL(candidate, url).href); } catch { /* Unsafe or non-HTTPS images are omitted. */ }
  return { url, name, description, category, kind, tags, image };
}

export async function linkPreview(input: string, read = readPublicResource) {
  const url = normalizeResourceUrl(input);
  if (sourceFromUrl(url)) return { ...(await xPreview(url)), category: undefined, image: "" };
  try {
    const page = await read(url);
    const details = pageDetails(page.body, page.url);
    let thumbnail = "";
    if (details.image) {
      try {
        const image = await read(details.image, "image");
        const validated = await validateUpload(new File([new Uint8Array(image.body)], "page-image", { type:image.contentType }));
        if (validated.kind !== "image") throw new Error("Not an image");
        const small = await sharp(validated.bytes).resize({width:320,height:180,fit:"inside",withoutEnlargement:true}).webp({quality:75}).toBuffer();
        thumbnail = `data:image/webp;base64,${small.toString("base64")}`;
      } catch { details.image = ""; }
    }
    return { ...details, thumbnail };
  } catch (error) {
    if (error instanceof ResourceError) throw error;
    throw new ResourceError("This page could not be read. You can enter the details yourself.", 422);
  }
}
