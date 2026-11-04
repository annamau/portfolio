import type { ResourceKind, ResourceLocale } from "@/data/resources";
const labels: Record<ResourceLocale, Record<ResourceKind, string>> = {
  en: { tool:"Tool",library:"Library",inspiration:"Inspiration",learning:"Documentation",post:"X post",article:"Article",video:"Video",audio:"Audio",image:"Image",file:"File" },
  es: { tool:"Herramienta",library:"Biblioteca",inspiration:"Inspiración",learning:"Documentación",post:"Post de X",article:"Artículo",video:"Vídeo",audio:"Audio",image:"Imagen",file:"Archivo" },
};
export const kindLabel = (kind: ResourceKind, locale: ResourceLocale) => labels[locale][kind];
export function resourceHost(url: string, locale: ResourceLocale): string {
  return url.startsWith("/") ? locale === "es" ? "Archivo guardado" : "Uploaded file" : new URL(url).hostname.replace(/^www\./, "");
}
