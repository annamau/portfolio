import type { MythologyEntity } from "./mythology-map.ts";

// Traditional attributes where familiar; the remaining realm marks and
// monograms are editorial navigation cues, not claims of ancient iconography.
export const deityEmblems: Record<string, { symbol: string; label: string }> = {
  zeus: { symbol: "bolt", label: "Thunderbolt" },
  poseidon: { symbol: "trident", label: "Trident" },
  hades: { symbol: "bident", label: "Bident and key" },
  hera: { symbol: "peacock", label: "Peacock feather" },
  demeter: { symbol: "wheat", label: "Wheat" },
  hestia: { symbol: "hearth", label: "Hearth flame" },
  athena: { symbol: "owl", label: "Owl" },
  ares: { symbol: "shield", label: "Shield and spear" },
  aphrodite: { symbol: "shell", label: "Scallop shell" },
  apollo: { symbol: "lyre", label: "Lyre" },
  artemis: { symbol: "bow", label: "Bow and crescent" },
  hermes: { symbol: "caduceus", label: "Winged herald's staff" },
  dionysus: { symbol: "grapes", label: "Grapes" },
  hephaestus: { symbol: "anvil", label: "Hammer and anvil" },
  persephone: { symbol: "pomegranate", label: "Pomegranate" },
  hecate: { symbol: "torches", label: "Twin torches" },
  melinoe: { symbol: "moon-torch", label: "Crescent and torch" },
  zagreus: { symbol: "bloodstone", label: "Bloodstone, from Hades" },
  nyx: { symbol: "night", label: "Night and stars" },
  thanatos: { symbol: "inverted-torch", label: "Inverted torch" },
  hypnos: { symbol: "sleep", label: "Wing and sleeping eye" },
  moros: { symbol: "thread", label: "A hanging thread, for doom" },
  nemesis: { symbol: "scales", label: "Scales" },
  charon: { symbol: "boat", label: "Boat and oar" },
  eris: { symbol: "apple", label: "Apple of discord" },
  "chronos-hades": { symbol: "hourglass", label: "Hourglass, for the Titan of Time" },
  "chronos-time": { symbol: "hourglass", label: "Hourglass, for time" },
  kronos: { symbol: "sickle", label: "Sickle" },
  gaia: { symbol: "earth", label: "Earth and growing leaves" },
  chaos: { symbol: "void", label: "The primordial opening" },
  uranus: { symbol: "sky", label: "Starry sky" },
  pontus: { symbol: "waves", label: "Sea waves" },
  oceanus: { symbol: "current", label: "Encircling current" },
  tethys: { symbol: "spring", label: "Flowing water" },
  helios: { symbol: "sun", label: "Sun" },
  selene: { symbol: "crescent", label: "Crescent moon" },
  eos: { symbol: "dawn", label: "Dawn" },
  rhea: { symbol: "crown", label: "Crown" },
  atlas: { symbol: "heavens", label: "The heavens on his shoulders" },
  prometheus: { symbol: "flame", label: "Stolen fire" },
  pan: { symbol: "pipes", label: "Pan pipes" },
  asclepius: { symbol: "serpent-staff", label: "Single serpent and staff" },
  nike: { symbol: "wing", label: "Wing of victory" },
  iris: { symbol: "rainbow", label: "Rainbow" },
  "eros-primordial": { symbol: "heart", label: "Love" },
  "dora-game": { symbol: "shade", label: "Friendly shade" },
  "dusa-game": { symbol: "gorgon", label: "Gorgon face" },
  medusa: { symbol: "serpents", label: "Serpent hair" },
  harpies: { symbol: "talon", label: "Wing and talon" },
};

export function mythologyEmblem(entity: MythologyEntity) {
  const personal = deityEmblems[entity.id];
  if (personal) return { ...personal, personal: true, monogram: "" };
  const categories = [...entity.categories, ...entity.domains].join(" ");
  const symbol = /sea|river|ocean|naiad|nereid|water/i.test(categories) ? "waves"
    : /nymph|tree|wood|dryad|forest/i.test(categories) ? "leaf"
    : /star|night|moon|primordial/i.test(categories) ? "sky"
    : /monster|gorgon|giant|harpy/i.test(categories) ? "talon"
    : /underworld|shade|death/i.test(categories) ? "shade" : "laurel";
  return { symbol, label: `${entity.name}${entity.qualifier ? `, ${entity.qualifier}` : ""} · individual seal`, personal: false, monogram: entity.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase() };
}
