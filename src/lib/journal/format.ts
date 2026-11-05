export type JournalInline = { type: "text" | "spoiler"; text: string } | { type: "link"; text: string; href: string };
export type JournalBlock =
  | { type: "paragraph" | "heading" | "quote"; content: JournalInline[] }
  | { type: "list"; items: JournalInline[][] }
  | { type: "image"; src: string; alt: string; caption: JournalInline[] }
  | { type: "chart"; name: string; caption: JournalInline[] };
export function journalUrl(value: string, image = false): string | null {
  if (image && /^\/journal\/[a-z0-9/_-]+\.(?:png|jpe?g|webp|svg)$/i.test(value) && !value.includes("..")) return value;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
export function journalInline(text: string): JournalInline[] {
  const tokens: JournalInline[] = []; let cursor = 0;
  const pattern = />!([\s\S]+?)!<|\[([^\]\n]+)\]\(([^\s)]+)\)/g;
  for (const match of text.matchAll(pattern)) {
    const index = match.index!;
    if (index > cursor) tokens.push({ type: "text", text: text.slice(cursor, index) });
    if (match[1] !== undefined) tokens.push({ type: "spoiler", text: match[1] });
    else {
      const href = journalUrl(match[3]);
      tokens.push(href ? { type: "link", text: match[2], href } : { type: "text", text: match[0] });
    }
    cursor = index + match[0].length;
  }
  if (cursor < text.length) tokens.push({ type: "text", text: text.slice(cursor) });
  return tokens;
}
export function journalBlocks(body: string): JournalBlock[] {
  return body.split(/\n\s*\n/).filter(Boolean).map((raw) => {
    const block = raw.trim();
    const image = block.match(/^!\[([^\]]*)\]\(([^\s)]+)\)(?:\n([\s\S]+))?$/);
    if (image) { const src = journalUrl(image[2], true); if (src) return { type: "image", src, alt: image[1], caption: journalInline(image[3] || "") }; }
    const chart = block.match(/^::chart\[([a-z][a-z0-9-]{0,63})\](?:\n([\s\S]+))?$/);
    if (chart) return { type: "chart", name: chart[1], caption: journalInline(chart[2] || "") };
    if (/^#{1,3} /.test(block)) return { type: "heading", content: journalInline(block.replace(/^#{1,3} /, "")) };
    const lines = block.split("\n");
    if (lines.every((line) => /^[-*] /.test(line))) return { type: "list", items: lines.map((line) => journalInline(line.slice(2))) };
    if (lines.every((line) => /^> /.test(line))) return { type: "quote", content: journalInline(block.replace(/^> /gm, "")) };
    return { type: "paragraph", content: journalInline(block) };
  });
}

export function journalCoverUrl(value: string): string {
  const origin = "https://andresnavesmauri.com";
  return value.startsWith(`${origin}/journal/`) ? value.slice(origin.length) : value;
}
