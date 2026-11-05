import type { Metadata } from "next";
import JournalEditor from "@/components/journal/JournalEditor";
export const metadata: Metadata = { title: "Write in the journal", robots: { index: false, follow: false }, alternates: { canonical: "/blog/write" } };
export default function WritePage() { return <JournalEditor/>; }
