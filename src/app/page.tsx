import Nav from "@/components/Nav";
import PortfolioHero from "@/components/PortfolioHero";
import { pageMetadata, shareImages, SITE_NAME } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/",
  title: `${SITE_NAME} — AI Product Engineer`,
  description: "Selected AI products, agent systems, automation infrastructure and digital experiences by Andrés Naves Mauri, based in Valencia.",
  image: shareImages.work,
});

export default function Home() {
  return (
    <>
      <Nav />
      <PortfolioHero />
    </>
  );
}
