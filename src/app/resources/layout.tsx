import { connection } from "next/server";
import { ResourceDataProvider } from "@/components/resources/ResourceData";
import { listPublishedResources } from "@/lib/resources/store";

export default async function ResourcesLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const published = await listPublishedResources().catch(() => null);
  return <ResourceDataProvider initialPublished={published}>{children}</ResourceDataProvider>;
}
