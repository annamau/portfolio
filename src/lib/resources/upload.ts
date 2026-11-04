import sharp from "sharp";
import { ResourceError } from "./model.ts";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export interface ValidatedUpload { bytes: Uint8Array; name: string; contentType: string; kind: "image" | "audio" | "video" | "file" }
export async function validateUpload(file: File): Promise<ValidatedUpload> {
  if (!file.size || file.size > MAX_UPLOAD_BYTES) throw new ResourceError("Choose a file up to 4 MB.", 413);
  const bytes = Buffer.from(await file.arrayBuffer());
  const name = file.name.replace(/[\r\n"\\/\x00-\x1f]/g, "_").slice(0, 160) || "upload";
  const ascii = (start: number, end: number) => bytes.subarray(start, end).toString("ascii");
  const isImage = bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) || bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || /^GIF8[79]a$/.test(ascii(0,6)) || (ascii(0,4)==="RIFF" && ascii(8,12)==="WEBP");
  if (isImage) {
    try {
      const data = await sharp(bytes, { limitInputPixels: 20_000_000 }).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
      return { bytes: data, name: name.replace(/\.[^.]+$/, "") + ".webp", contentType: "image/webp", kind: "image" };
    } catch { throw new ResourceError("This image could not be read. Use a PNG, JPEG, GIF or WebP image."); }
  }
  if (ascii(0,5)==="%PDF-") return { bytes, name, contentType: "application/pdf", kind: "file" };
  if (ascii(0,4)==="RIFF" && ascii(8,12)==="WAVE") return { bytes, name, contentType: "audio/wav", kind: "audio" };
  if (ascii(0,3)==="ID3" || (bytes[0]===0xff && (bytes[1]&0xe0)===0xe0)) return { bytes, name, contentType: "audio/mpeg", kind: "audio" };
  if (ascii(0,4)==="OggS" && file.type==="audio/ogg") return { bytes, name, contentType: "audio/ogg", kind: "audio" };
  if (ascii(4,8)==="ftyp") {
    if (file.type==="audio/mp4" || /\.m4a$/i.test(name)) return { bytes, name, contentType: "audio/mp4", kind: "audio" };
    if (file.type==="video/mp4") return { bytes, name, contentType: "video/mp4", kind: "video" };
  }
  if (bytes.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3])) && ["audio/webm","video/webm"].includes(file.type)) return { bytes, name, contentType: file.type, kind: file.type==="audio/webm" ? "audio" : "video" };
  throw new ResourceError("Use an image, MP3, WAV, Ogg, M4A, MP4, WebM or PDF. HTML and SVG uploads are not supported.");
}
