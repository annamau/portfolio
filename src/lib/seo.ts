import type { Metadata } from "next";

export const SITE_URL = "https://andresnavesmauri.com";
export const SITE_NAME = "Andrés Naves Mauri";

type ShareImage = { url: string; alt: string; width?: number; height?: number; type?: string };

function jpegCard(name: string, alt: string): ShareImage {
  return { url: `/share/${name}.jpg`, alt, width: 1200, height: 630, type: "image/jpeg" };
}

export const shareImages = {
  work: jpegCard("work", "Andrés Naves Mauri, AI product engineering and selected work"),
  journal: jpegCard("journal", "Journal by Andrés Naves Mauri"),
  resources: jpegCard("resources", "The Resource Library by Andrés Naves Mauri"),
  cv: jpegCard("cv", "CV and application pack by Andrés Naves Mauri"),
};

const journalCoverCards = new Map<string, ShareImage>([
  [`${SITE_URL}/journal/wildwood/prue-and-brendan.webp`, jpegCard("wildwood", "Prue stands beside her bicycle as Brendan rides through the forest in Wildwood")],
  [`${SITE_URL}/journal/hades-ii/game-cast.avif`, jpegCard("greek-mythology", "A lineup of characters from Hades II")],
]);

export function journalShareImage(cover: string, title: string): ShareImage {
  if (!cover) return shareImages.journal;
  return journalCoverCards.get(cover) ?? { url: cover, alt: `Cover image for ${title}` };
}

type PageDetails = {
  path: string;
  title: string;
  description: string;
  image: ShareImage;
  socialTitle?: string;
  article?: { publishedTime?: string; modifiedTime: string; section?: string };
};

export function pageMetadata({ path, title, description, image, socialTitle = title, article }: PageDetails): Metadata {
  const url = new URL(path, SITE_URL).href;
  const card = { title: socialTitle, description, images: [image] };

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      ...card,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      ...(article ? { type: "article", authors: [SITE_URL], ...article } : { type: "website" }),
    },
    twitter: { card: "summary_large_image", ...card },
  };
}
