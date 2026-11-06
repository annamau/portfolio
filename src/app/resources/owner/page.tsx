import type { Metadata } from "next";
import ResourceInbox from "@/components/resources/ResourceInbox";

export const metadata: Metadata = {
  title: "Owner access",
  robots: { index: false, follow: false },
};

export default function OwnerPage() {
  return <ResourceInbox ownerEntry />;
}
