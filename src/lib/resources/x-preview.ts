import { normalizeResourceUrl, sourceFromUrl } from "./model.ts";

function plainText(html: string): string {
  return html.replace(/<br\s*\/?\s*>/gi," ").replace(/<[^>]+>/g, " ").replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();
}
export async function xPreview(input: string) {
  const url = normalizeResourceUrl(input);
  const source = sourceFromUrl(url);
  if (!source) return { url, name: new URL(url).hostname, description: "", kind: "tool", tags: [] };
  const response = await fetch(`https://publish.x.com/oembed?${new URLSearchParams({ url, omit_script: "true", dnt: "true" })}`, { signal: AbortSignal.timeout(8000), cache: "no-store", redirect: "error" });
  if (!response.ok) return { url, name: `Saved post ${source.author}`, description: "", kind: "post", tags: ["X"], source };
  const data = await response.json() as { html?: string; author_name?: string };
  const paragraph = (data.html || "").match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] || "";
  const excerpt = plainText(paragraph).replace(/https?:\/\/\S+/g, "").trim().split(/\s+/).slice(0,20).join(" ");
  return { url, name: `${data.author_name || source.author} · saved post`, description: excerpt, source, kind: "post", tags: ["X"] };
}
