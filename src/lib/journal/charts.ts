import { ResourceError } from "../resources/model.ts";
import { readRecord, writeRecord } from "../resources/record-store.ts";
import { validPostId } from "./model.ts";
export const validChartName = (name: string) => /^[a-z][a-z0-9-]{0,63}$/.test(name);
export interface JournalChart { postId: string; name: string; html: string; version: number }
export async function getChart(postId: string, name: string): Promise<JournalChart | null> {
  if (!validPostId(postId) || !validChartName(name)) return null;
  return readRecord<JournalChart>(`journal-charts/${postId}/${name}`);
}
export async function saveChart(input: Record<string, unknown>) {
  const { postId, name, html, version } = input;
  if (typeof postId !== "string" || !validPostId(postId) || typeof name !== "string" || !validChartName(name) || typeof html !== "string" || html.length > 1_200_000 || !html.trim() || !Number.isInteger(version) || (version as number) < 0) throw new ResourceError("Invalid journal figure.");
  await writeRecord(`journal-charts/${postId}/${name}`, { postId, name, html, version: (version as number) + 1 }, version as number);
}
export const chartSecurityHeaders = {
  "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "Vary": "Cookie", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
};
