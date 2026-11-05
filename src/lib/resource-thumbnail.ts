import { resourceCollections } from "../data/resources.ts";
import { resourcePreviews } from "../data/resource-media.ts";
import type { Resource } from "../data/resources.ts";

const escapeXml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!);

/** A local image for new links and unavailable previews; never calls a screenshot service. */
export function fallbackThumbnail(resource: Resource): string {
  const group = resourceCollections.find(({ id }) => id === resource.category) || resourceCollections[0];
  const dark = !!resource.source;
  const paper = dark ? "#29231f" : "#eee5d6";
  const ink = dark ? "#fff1db" : "#372b22";
  const accent = dark ? "#d2b397" : group.color;
  const words = resource.name.split(/\s+/);
  const lines: string[] = [""];
  for (const word of words) {
    const line = lines.length - 1;
    if (lines[line].length + word.length > 26 && lines[line]) {
      if (lines.length === 2) { lines[line] = lines[line].slice(0, 25).trimEnd() + "…"; break; }
      lines.push(word.slice(0, 26));
    } else lines[line] += `${lines[line] ? " " : ""}${word}`;
  }
  let host = "Saved file";
  try { if (resource.url.startsWith("https://")) host = new URL(resource.url).hostname.replace(/^www\./, ""); } catch { /* Uploaded files use a local media URL. */ }
  const label = resource.source?.author || host;
  const initials = resource.source ? "X" : resource.name.split(/\s+/).slice(0, 2).map((word) => [...word][0]).join("").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="440" viewBox="0 0 840 440">
<rect width="840" height="440" fill="${paper}"/>
<circle cx="762" cy="106" r="195" fill="none" stroke="${accent}" stroke-opacity=".16" stroke-width="52"/>
<path d="M620 270h136v86H620zM628 270v-14h54l13 14" fill="none" stroke="${accent}" stroke-opacity=".3" stroke-width="2"/>
<text x="42" y="47" fill="${ink}" opacity=".5" font-family="monospace" font-size="11" letter-spacing="2">ANDRÉS NAVES / RESOURCES</text>
<rect x="42" y="95" width="63" height="63" rx="15" fill="${accent}"/>
<text x="73" y="136" text-anchor="middle" fill="#fff9ef" font-family="Georgia,serif" font-size="27">${escapeXml(initials)}</text>
${lines.map((line, index) => `<text x="42" y="${222 + index * 58}" fill="${ink}" font-family="Georgia,serif" font-size="52" letter-spacing="-1.6">${escapeXml(line)}</text>`).join("")}
<path d="M42 343h756" stroke="${accent}" stroke-opacity=".25"/>
<text x="42" y="381" fill="${ink}" opacity=".55" font-family="monospace" font-size="15">${escapeXml(label.slice(0, 55))}</text>
<text x="798" y="381" text-anchor="end" fill="${accent}" font-family="monospace" font-size="11">${escapeXml(group.name.en.toUpperCase())}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function resourceThumbnail(resource: Resource, failed = false): string {
  const preview = !failed ? resource.preview || resourcePreviews[resource.id] : undefined;
  return preview || fallbackThumbnail(resource);
}
