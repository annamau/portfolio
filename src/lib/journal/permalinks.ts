export const journalPermalinks = new Map([
  ["hades-ii-and-the-stories-i-grew-up-with-54a36721", "fell-in-love-with-greek-mythology-again"],
  ["how-did-they-make-the-arrows-fly-ece5025d", "how-did-they-make-the-arrows-fly"],
]);

export function journalSlug(storedSlug: string) {
  return journalPermalinks.get(storedSlug) ?? storedSlug;
}
