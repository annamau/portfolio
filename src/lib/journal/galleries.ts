import sharp from "sharp";
import { ResourceError } from "../resources/model.ts";
import { readRecord, writeRecord } from "../resources/record-store.ts";
import { validateUpload } from "../resources/upload.ts";
import { validPostId } from "./model.ts";

export interface GalleryImage {
  src: string;
  title: string;
  alt: string;
  width: number;
  height: number;
}

export interface JournalGallery {
  postId: string;
  name: string;
  title: string;
  images: GalleryImage[];
  version: number;
}

const validName = (name: unknown): name is string => typeof name === "string" && /^[a-z][a-z0-9-]{0,63}$/.test(name);

function text(value: unknown, maximum: number) {
  if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new ResourceError("Add a short gallery title and a description for each image.");
  return value.trim();
}

export async function getGallery(postId: string, name: string): Promise<JournalGallery | null> {
  if (!validPostId(postId) || !validName(name)) return null;
  return readRecord<JournalGallery>(`journal-galleries/${postId}/${name}`);
}

export async function saveGallery(input: Record<string, unknown>) {
  const { postId, name, version } = input;
  if (typeof postId !== "string" || !validPostId(postId) || !validName(name) || !Number.isInteger(version) || (version as number) < 0) throw new ResourceError("Invalid journal gallery.");
  if (!Array.isArray(input.images) || input.images.length < 1 || input.images.length > 12) throw new ResourceError("A gallery needs between 1 and 12 images.");
  const title = text(input.title, 160);
  const images = await Promise.all(input.images.map(async (image): Promise<GalleryImage> => {
    if (!image || typeof image !== "object" || typeof image.src !== "string" || image.src.length > 1_000_000) throw new ResourceError("Use a small JPEG, PNG or WebP image.");
    const match = image.src.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match) throw new ResourceError("Use a JPEG, PNG or WebP image.");
    const imageTitle = text(image.title, 160);
    const alt = text(image.alt, 500);
    const bytes = Buffer.from(match[2], "base64");
    const upload = await validateUpload(new File([bytes], `painting.${match[1]}`, { type: `image/${match[1]}` }));
    if (upload.kind !== "image") throw new ResourceError("Use an image in the gallery.");
    const metadata = await sharp(upload.bytes).metadata();
    return { src: `data:image/webp;base64,${Buffer.from(upload.bytes).toString("base64")}`, title: imageTitle, alt, width: metadata.width!, height: metadata.height! };
  }));
  const gallery: JournalGallery = { postId, name, title, images, version: (version as number) + 1 };
  await writeRecord(`journal-galleries/${postId}/${name}`, gallery, version as number);
  return gallery;
}
