# Mythology comparison catalogue

Nine curated JSON shards supply 434 figures and collectives, including separately attributed game adaptations. `npm run build:mythology` explicitly generates the sourced catalogue and reviewed full-cast drawings. `npm run check:mythology` is read-only; normal release builds validate rather than redraw those artifacts.

The public knowledge file is `public/journal/greek-mythology.json`: canonical IDs, names, aliases, qualifiers, roles, short stories, memorable details, source-specific origins, non-parent relationships, exact source locations, coverage and unresolved questions. It is a growing named catalogue, not every being in every surviving tradition. The full download includes game spoilers.

`public/journal/greek-mythology-layout.json` keeps six top-to-bottom reference layouts, each with an unrevealed and revealed state. A topological parent ordering replaces the old force simulation. Alternate source views reorder names without turning competing origins into one agreed genealogy. Release checks pin the source/generator fingerprints, complete casts, finite positions and non-overlapping circles.

## The two views

The blog starts with 22 chosen figures. Cast controls can select, deselect or clear names and explicitly show the full available catalogue. Direct parents remain as small markers even when their full seals are unselected. Additional shortest-path markers keep the chosen names connected through sourced relationships; no new parent facts are invented.

- Game view: game-attested links are green. Older mythology is pale background where the game has no checked account. A known game parent set replaces a competing ancient parent set, including when the game account remains covered.
- Ancient view: excludes game-only people and all game-only edges. The reader can choose a source tradition. Homer and the Homeric Hymns are grouped for reading rather than assigned to one author; Orphic traditions remain plural.

The smaller displayed graphs are laid out in the browser from a cropped drawing model. The profile and download retain the original complete parent claims. Cropping does not rewrite the underlying knowledge. Source-specific parent alternatives remain independent records and can be traced individually in their relevant graph.

Native dialogs expand either graph, trap focus, restore focus on close and allow free dragging. The ordinary article keeps vertical page scrolling. There is no iframe or internal graph scrollbar. Phones stack the two views; larger screens place them together.

Every chosen seal retains its name. Familiar figures have individual vector emblems; lesser-known entries use realm marks and name monograms. These are editorial navigation cues. The Met’s divine-attribute guide and Getty’s Apollo example are linked in the component. No generated game portraits or paid TinyCharts template is distributed.

Profiles have an authored short biography for familiar names, with source-bounded family and role descriptions for lesser-known figures. List-only names do not receive invented adventures. Creation and emergence use different wording from ordinary parentage. The same `shortStory` and `rememberThis` strings are included in the downloadable JSON.

## Source and spoiler rules

Do not combine a couple into one entity. Preserve same-name identities and qualifiers. Keep Chronos/Kronos, Helios/Apollo and Selene/Artemis separate unless a source-specific identification is explicitly recorded. Dusa is not asserted to be Medusa.

A lineage’s parents form one attributed account. Unknown parents remain unknown. Relationship records such as mentor, marriage, membership and sequence are not parentage. Hecate’s game care for Melinoë is a mentor link. The new game comparison claims use attributed dialogue transcripts and a game review; source types identify community-maintained game references.

Major reveals carry `spoiler: true` on edges and, where necessary, the person itself. The cast picker, search, profiles and both graphs omit those people and claims until the gray cover is uncovered. Revealed drawings then include the complete ancestry. A covered game origin never falls back to its known-contradictory ancient parent set.

The essay stays a private draft. Its prose is not application data. The localhost draft’s generic chart caption was updated to describe the two views.

## Acceptance

`npm run build` checks the accepted data, runs unit tests, builds Next/TypeScript and runs the existing bundle, API and cloud privacy regressions. Tests cover complete parents in the default small cast, source differences, covered people, top-to-bottom ancestry, cast removal, biography semantics, JSON/profile consistency and read-only release validation.

Chrome acceptance checks the cast controls, both source graphs, native dialogs and Escape/focus restoration, page scrolling, 320px/390px widths, no horizontal overflow, no graph scrollers, and hidden/revealed game ancestry. Physical touch hardware is not part of the responsive-browser check.
