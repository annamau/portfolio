import { pageMetadata, shareImages } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/cv",
  title: "CV & Application Pack Generator",
  socialTitle: "CV Generator | Andrés Naves Mauri",
  description: "Explore Andrés Naves Mauri’s experience in AI product engineering and automation, or generate a tailored CV and application pack for a job listing.",
  image: shareImages.cv,
});

export default function CvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
