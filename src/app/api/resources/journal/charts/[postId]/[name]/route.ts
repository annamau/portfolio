import { isOwner } from "@/lib/resources/auth";
import { failure, json } from "@/lib/resources/http";
import { getPost } from "@/lib/journal/store";
import { chartSecurityHeaders, getChart } from "@/lib/journal/charts";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ postId: string; name: string }> }) {
  try {
    const { postId, name } = await params; const post = await getPost(postId);
    if (!post || (post.status !== "published" && !isOwner(request))) return json({ error: "Figure not found." }, 404);
    const chart = await getChart(postId, name); if (!chart) return json({ error: "Figure not found." }, 404);
    return new Response(chart.html, { headers: chartSecurityHeaders });
  } catch (error) { return failure(error); }
}
