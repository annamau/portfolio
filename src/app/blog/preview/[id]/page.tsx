import type { Metadata } from "next";
import JournalDraftPreview from "@/components/journal/JournalDraftPreview";
export const metadata: Metadata = { title: "Private journal preview", robots: { index: false, follow: false } };
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <JournalDraftPreview id={id}/>; }
