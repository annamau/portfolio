import { ResourceDataProvider } from "@/components/resources/ResourceData";
export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <ResourceDataProvider>{children}</ResourceDataProvider>;
}
