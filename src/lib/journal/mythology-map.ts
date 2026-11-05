export interface MythologyNode {
  id: string;
  name: string;
  role: string;
  relation?: string;
  edge?: "context" | "emergence";
  passage?: string;
  children?: MythologyNode[];
}

// A selected reading of Hesiod, not a merged genealogy of every tradition.
// Context edges join the first beings and story settings without implying birth.
export const mythologyMap: MythologyNode = {
  id: "first-beings", name: "First beings", role: "At the beginning of Hesiod's telling",
  children: [
    {
      id: "chaos", name: "Chaos", role: "The primordial opening", edge: "context", passage: "116–125",
      children: [{
        id: "nyx", name: "Nyx", role: "Night", passage: "123–125",
        children: [
          { id: "moros", name: "Moros", role: "Doom", passage: "211–225" },
          { id: "thanatos", name: "Thanatos", role: "Death", passage: "211–225" },
          { id: "hypnos", name: "Hypnos", role: "Sleep", passage: "211–225" },
          { id: "eris", name: "Eris", role: "Strife", passage: "211–225" },
          { id: "nemesis", name: "Nemesis", role: "Retribution", passage: "223" },
        ],
      }],
    },
    {
      id: "gaia", name: "Gaia", role: "Earth", edge: "context", passage: "116–132",
      children: [
        {
          id: "uranus", name: "Uranus", role: "Sky", passage: "126–132",
          children: [
            {
              id: "cronus-rhea", name: "Cronus + Rhea", role: "Two of the Titans", relation: "Children of Uranus and Gaia", passage: "133–138, 453–458",
              children: [
                { id: "hestia", name: "Hestia", role: "Hearth & household" },
                {
                  id: "demeter", name: "Demeter", role: "Grain & harvest",
                  children: [{ id: "persephone", name: "Persephone", role: "Queen of the Underworld", relation: "With Zeus", passage: "912–914" }],
                },
                {
                  id: "hera", name: "Hera", role: "Queenship & marriage",
                  children: [{ id: "hephaestus", name: "Hephaestus", role: "Smithing & crafts", relation: "Hera alone, in Hesiod", passage: "924–929" }],
                },
                {
                  id: "hades", name: "Hades", role: "Ruler of the dead",
                  children: [{
                    id: "underworld", name: "The Underworld", role: "A realm, not a parent", relation: "Hades rules here", edge: "context",
                    children: [{ id: "charon", name: "Charon", role: "Ferryman of the dead", relation: "Works in this realm", edge: "context" }],
                  }],
                },
                {
                  id: "poseidon", name: "Poseidon", role: "Sea & earthquakes",
                  children: [{
                    id: "sea", name: "The sea", role: "A setting, not a parent", relation: "Poseidon's realm", edge: "context",
                    children: [{ id: "scylla", name: "Scylla", role: "Sea monster", relation: "An encounter in the Odyssey", edge: "context" }],
                  }],
                },
                {
                  id: "zeus", name: "Zeus", role: "Sky & thunder",
                  children: [
                    { id: "apollo", name: "Apollo", role: "Music & prophecy", relation: "With Leto", passage: "918–920" },
                    { id: "artemis", name: "Artemis", role: "Hunting & wild animals", relation: "With Leto", passage: "918–920" },
                    { id: "athena", name: "Athena", role: "Wisdom, crafts & war", relation: "With Metis; born from Zeus's head", passage: "886–900, 924–926" },
                    { id: "ares", name: "Ares", role: "War & battle", relation: "With Hera", passage: "921–923" },
                    { id: "hermes", name: "Hermes", role: "Travel, messages & trickery", relation: "With Maia", passage: "938–939" },
                    { id: "dionysus", name: "Dionysus", role: "Wine & revelry", relation: "With Semele", passage: "940–942" },
                  ],
                },
              ],
            },
            {
              id: "hyperion-theia", name: "Hyperion + Theia", role: "Two more Titans", relation: "Children of Uranus and Gaia", passage: "133–138, 371–374",
              children: [
                { id: "helios", name: "Helios", role: "The Sun" },
                { id: "selene", name: "Selene", role: "The Moon" },
              ],
            },
            {
              id: "coeus-phoebe", name: "Coeus + Phoebe", role: "Titans", relation: "Children of Uranus and Gaia", passage: "133–138, 404–411",
              children: [
                { id: "leto", name: "Leto", role: "Mother of Apollo & Artemis" },
                {
                  id: "asteria", name: "Asteria", role: "Mother of Hecate",
                  children: [{ id: "hecate", name: "Hecate", role: "Magic & crossroads", relation: "With Perses", passage: "404–411" }],
                },
              ],
            },
            {
              id: "aphrodite", name: "Aphrodite", role: "Love & desire", edge: "emergence",
              relation: "From sea foam after Uranus's castration", passage: "188–206",
            },
          ],
        },
        {
          id: "pontus", name: "Pontus", role: "The primordial Sea", passage: "126–132",
          children: [{
            id: "thaumas", name: "Thaumas", role: "A child of Earth & Sea", relation: "With Gaia", passage: "233–239",
            children: [{ id: "harpies", name: "Harpies", role: "Swift winged beings", relation: "With Electra, daughter of Oceanus & Tethys", passage: "265–269, 346–360" }],
          }],
        },
      ],
    },
  ],
};
