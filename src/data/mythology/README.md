# Greek mythology catalogue

The eight JSON shards are the editable research records. `npm run build:mythology` merges and validates them, then writes the public knowledge file and reviewed drawing positions:

- `public/journal/greek-mythology.json`: names, aliases, qualifiers, roles, origin notes, source-specific lineages, other relationships, exact references, coverage and unresolved questions.
- `public/journal/greek-mythology-layout.json`: generated coordinates only. D3 runs during explicit generation, not in the reader's browser.

The current scope is 433 figures and collectives, including named divine groups, nymphs, creatures, relevant mortals and game characters. It is a growing source-backed catalogue, not every named or unnamed being in every surviving tradition. Coverage records state the enumerated groups. In particular, the Theogony says fifty Nereids but its transmitted name list yields 51 distinct entries; the data keeps those names and the discrepancy.

Each figure has one canonical ID. Same-name figures remain separate, with readable qualifiers. Never combine a couple into one entity or conflate Chronos with Kronos, Helios with Apollo, or Selene with Artemis. Claims that identify figures need their own attributed `identified_with` relationship.

A lineage's `parents` is one source's parent set. Alternatives are separate records sharing `variantGroup`, including game adaptations. A one-parent excerpt may be partial, rather than a denial of a second parent. `emergence` and `creation` distinguish foam-born or generated origins from ordinary birth. `originNotes` retain source-specific accounts that name no parent.

Other ties preserve the author's relation, such as marriage, group membership, sequence or companionship. They connect the reading network without fabricating ancestry. No universal editorial ancestor is added: Chaos precedes Gaia in Hesiod's telling, but is not assigned as Gaia's parent. A connected network may contain mutually incompatible traditions; it is not one reconciled biological tree. In particular, the Athenian Daedalus ancestry differs between Apollodorus and Diodorus.

Every entity and claim needs source references with a passage or explicit location. Source types distinguish ancient texts, scholarly references, ordinary reference compilations, primary game material and game references. A Theoi quotation page may host several different works; sharing a URL does not make them the same ancient source. Some claims survive through later witnesses or secondary compilations, and retain those limitations. Unresolved notes are research questions, not extra facts.

Game identity and major parentage reveals carry `spoiler: true`. The blog omits their arrows, origin cards, neighbor choices and relationship details until the reader uncovers the gray spoiler text. The full downloadable JSON includes spoilers and says so beside its link. Game-only companion ties keep the unrevealed graph connected. Dusa is not asserted to be Medusa.

Three research agents gathered and sampled each other's records. An independent integration pass checked endpoints, source IDs and selected high-risk variants. This is not an exhaustive scholarly audit of every entry. Review corrected Athenaeus's Hamadryad passage to Deipnosophistae 3.78b (3.14) and separated differently named or identified sources.

The telling selector reorders a precomputed layout around source-specific ties. Nonselected accounts remain faintly connected, preserving the full network. Presets are Hesiod, Homer and the Homeric Hymns, multiple Orphic traditions, Apollodorus, and the Hades games. The hymns are explicitly grouped for reading, not assigned to a single author. A per-origin radio can trace one exact parent set, including alternatives within the same author. It changes that figure's emphasized parents without discarding the other claims. Choosing a new figure or telling clears that override. Game spoilers stay filtered in every view.

The native SVG component takes visual inspiration from the public TinyCharts `#spread` network example. It uses original application code, the portfolio's fonts and colors, and generated coordinates. It does not embed an external product or distribute the paid Network template.

## Acceptance

`npm run build` validates the committed catalogue and reviewed layout, runs unit tests, builds Next, and checks the existing bundle, API and cloud privacy regressions. Mythology tests pin actual parent edges, source-separated alternatives, references, coverage, connectedness with spoilers hidden, collision-free circle positions, namesake search identities, keyboard catalogue traversal, connection navigation and parent-inclusive camera frames.

Browser acceptance additionally checks desktop and phone views, actual node focus, searching, source details, whole-network view, zoom/pan, page scrolling, opt-in map movement, spoiler reveal, and no iframe or internal scrolling element. Physical touch hardware is a separate limitation when only desktop Chrome's responsive viewport is available.


Release builds deliberately do not regenerate drawing coordinates. Floating-point force simulations on another deployment runtime produced different geometry from the reviewed artifact. `npm run check:mythology` is read-only: it checks the catalogue, source/generator SHA-256 provenance, all six complete casts, finite bounds/positions and nonoverlapping circles. A source or generator change fails until `npm run build:mythology` explicitly regenerates a new layout for review. The regression test pins the release check's no-write behavior, and another test rejects stale provenance.
