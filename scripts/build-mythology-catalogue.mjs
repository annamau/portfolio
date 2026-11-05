import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createGenerationalLayout } from '../src/lib/journal/mythology-layout.ts';
import { mythologyStory } from '../src/lib/journal/mythology-stories.ts';
import { mythologyEdges, mythologyReadings, connectedMythologyGroups } from '../src/lib/journal/mythology-map.ts';
const root = new URL('../', import.meta.url);
const union = (values) => [...new Set(values)];
const refs = (values) => [...new Map(values.map((value) => [`${value.sourceId}:${value.passage}`, value])).values()];
const orderedShards = ['primordials-titans', 'olympians-underworld', 'sea-nymphs-creatures', 'primordial-expansion', 'olympian-expansion', 'nymph-expansion', 'final-gaps', 'atthis-gaps', 'game-comparison-gaps'];
export async function buildCatalogue() {
  const catalogue = {
    schemaVersion: 1,
    metadata: {
      title: 'Greek mythology: a connected reading map', asOf: '2026-11-05',
      scope: 'Named figures in the cited Greek and later traditions, with a separately attributed Hades game layer. A growing catalogue, not every being in every surviving myth.',
      cautions: [
        'Parent sets are source-specific claims. Different tellings must not be combined into a single genealogy.',
        'Solid arrows show parentage; dotted arrows show emergence or creation. Dashed ties show membership, sequence or story relationships, never parentage.',
        'A connected network is not a claim that every figure descends from Chaos. Hesiod names several first beings without giving them parents.',
        'Collectives and individuals are distinct. Many nymphs are unnamed; coverage lists state exactly what has been enumerated.',
        'Hades game origins and character identities differ from ancient sources. This download includes game spoilers.',
        'Research was cross-checked on selected claims. Late, fragmentary and secondary attestations retain their limitations.',
      ], counts: {},
    },
    entities: [], lineages: [], relationships: [], sources: [], coverage: [], unresolved: [],
  };
  const entities = new Map(), sources = new Map();
  for (const name of orderedShards) {
    const shard = JSON.parse(await readFile(new URL(`src/data/mythology/${name}.json`, root), 'utf8'));
    const rename = new Map();
    for (const original of shard.sources) {
      const source = { ...original };
      if (sources.has(source.id) && sources.get(source.id).url !== source.url) {
        source.id = `${source.id}-${name}`; rename.set(original.id, source.id);
      }
      sources.set(source.id, source);
    }
    const remap = (record) => ({ ...record, sourceRefs: record.sourceRefs.map((ref) => ({ ...ref, sourceId: rename.get(ref.sourceId) || ref.sourceId })) });
    for (const record of shard.entities.map(remap)) {
      const previous = entities.get(record.id);
      if (previous) {
        assert.equal(previous.name, record.name, `Identity collision: ${record.id}`);
        assert.equal(previous.kind, record.kind, `Kind collision: ${record.id}`);
        record.aliases = union([...previous.aliases, ...record.aliases]);
        record.categories = union([...previous.categories, ...record.categories]);
        record.domains = union([...previous.domains, ...record.domains]);
        record.sourceRefs = refs([...previous.sourceRefs, ...record.sourceRefs]);
      }
      entities.set(record.id, record);
    }
    catalogue.lineages.push(...shard.lineages.map(remap));
    catalogue.relationships.push(...shard.relationships.map(remap));
    catalogue.coverage.push(...shard.coverage.map(remap));
    catalogue.unresolved.push(...shard.unresolved);
  }
  catalogue.entities = [...entities.values()].sort((a, b) => a.id.localeCompare(b.id));
  catalogue.sources = [...sources.values()].sort((a, b) => a.id.localeCompare(b.id));
  for (const key of ['lineages', 'relationships']) {
    const seen = new Map(), usedIds = new Set();
    for (const record of catalogue[key]) {
      const signature = JSON.stringify([record.child, record.parents?.slice().sort(), record.mode, record.from, record.to, record.type, record.tradition, record.sourceRefs]);
      if (seen.has(signature)) continue;
      let id = record.id, suffix = 2;
      while (usedIds.has(id)) id = `${record.id}-${suffix++}`;
      usedIds.add(id); seen.set(signature, { ...record, id });
    }
    catalogue[key] = [...seen.values()].sort((a, b) => a.id.localeCompare(b.id));
  }
  catalogue.unresolved = [...new Map(catalogue.unresolved.filter((record) => !/external endpoint/i.test(record.issue) || !entities.has(record.entityId)).map((record) => [`${record.entityId}:${record.issue}`, record])).values()];
  for (const record of [...catalogue.entities, ...catalogue.lineages, ...catalogue.relationships, ...catalogue.coverage, ...catalogue.entities.flatMap((entity) => entity.originNotes || [])]) {
    assert.ok(record.sourceRefs.length, `Missing evidence: ${record.id || record.group}`);
    for (const ref of record.sourceRefs) {
      assert.ok(sources.has(ref.sourceId), `Missing source: ${ref.sourceId}`);
      assert.ok(ref.passage.trim(), `Missing passage: ${ref.sourceId}`);
    }
  }
  const edges = mythologyEdges(catalogue);
  for (const edge of edges) {
    assert.ok(entities.has(edge.from), `Missing endpoint: ${edge.from}`);
    assert.ok(entities.has(edge.to), `Missing endpoint: ${edge.to}`);
    assert.notEqual(edge.from, edge.to, `Self edge: ${edge.id}`);
  }
  for (const coverage of catalogue.coverage) {
    assert.equal(new Set(coverage.entityIds).size, coverage.entityIds.length, `Repeated member: ${coverage.group}`);
    if (coverage.expected !== null) assert.equal(coverage.entityIds.length, coverage.expected, `Coverage count: ${coverage.group}`);
    for (const id of coverage.entityIds) assert.ok(entities.has(id), `Missing coverage member: ${id}`);
  }
  const groups = connectedMythologyGroups([...entities.keys()], edges);
  assert.equal(groups.length, 1, `Disconnected groups: ${JSON.stringify(groups.filter((group) => group.length < 50))}`);
  assert.equal(connectedMythologyGroups(catalogue.entities.filter((entity) => !entity.spoiler).map((entity) => entity.id), edges.filter((edge) => !edge.spoiler && !entities.get(edge.from).spoiler && !entities.get(edge.to).spoiler)).length, 1, 'Spoilers must not hold the network together');
  catalogue.metadata.counts = { entities: entities.size, individualFigures: catalogue.entities.filter((entity) => entity.kind === 'individual').length, collectives: catalogue.entities.filter((entity) => entity.kind === 'collective').length, lineageClaims: catalogue.lineages.length, otherRelationships: catalogue.relationships.length, connections: edges.length, sources: sources.size, connectedGroups: groups.length };
  for (const entity of catalogue.entities) {
    const story = mythologyStory(entity, catalogue);
    entity.shortStory = story.story; entity.rememberThis = story.detail;
  }
  return catalogue;
}
export const buildLayout = createGenerationalLayout;

export async function drawingProvenance(catalogue) {
  const hash = (value) => createHash('sha256').update(value).digest('hex');
  const [builder, model, layout] = await Promise.all([readFile(import.meta.url.startsWith('file:') ? new URL(import.meta.url) : import.meta.url, 'utf8'), readFile(new URL('src/lib/journal/mythology-map.ts', root), 'utf8'), readFile(new URL('src/lib/journal/mythology-layout.ts', root), 'utf8')]);
  return { catalogueSha256: hash(JSON.stringify(catalogue)), generatorSha256: hash(builder + '\n' + model + '\n' + layout) };
}

export function validateAcceptedDrawing(catalogue, layout, provenance) {
  assert.deepEqual(layout.provenance, provenance, 'Drawing inputs changed. Run npm run build:mythology and review the regenerated map.');
  const ids = catalogue.entities.map((entity) => entity.id).sort();
  for (const reading of mythologyReadings) {
    const normal = reading.id === 'all' ? layout : layout.readings?.[reading.id];
    for (const view of [normal, normal?.revealed]) {
    assert.ok(view, `Missing drawing: ${reading.id}`);
    assert.deepEqual(view.nodes.map((node) => node.id).sort(), ids, `Drawing cast: ${reading.id}`);
    assert.ok(Object.values(view.bounds).every(Number.isFinite) && view.bounds.width > 0 && view.bounds.height > 0, `Invalid bounds: ${reading.id}`);
    for (let i = 0; i < view.nodes.length; i++) {
      const node = view.nodes[i];
      assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y) && node.radius > 0, `Invalid position: ${node.id}`);
      for (const other of view.nodes.slice(i + 1)) assert.ok(Math.hypot(node.x - other.x, node.y - other.y) > node.radius + other.radius, `Overlapping circles: ${node.id}/${other.id}`);
    }
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const catalogue = await buildCatalogue(), provenance = await drawingProvenance(catalogue);
  const destination = new URL('public/journal/', root);
  if (process.argv.includes('--check')) {
    assert.deepEqual(JSON.parse(await readFile(new URL('greek-mythology.json', destination), 'utf8')), catalogue, 'Catalogue inputs changed. Run npm run build:mythology.');
    validateAcceptedDrawing(catalogue, JSON.parse(await readFile(new URL('greek-mythology-layout.json', destination), 'utf8')), provenance);
  } else {
    const drawing = (reading) => ({ ...buildLayout(catalogue, reading), revealed: buildLayout(catalogue, reading, true) });
    const layout = drawing('all');
    layout.readings = Object.fromEntries(mythologyReadings.filter((reading) => reading.id !== 'all').map((reading) => [reading.id, drawing(reading.id)]));
    layout.provenance = provenance;
    validateAcceptedDrawing(catalogue, layout, provenance);
    await mkdir(destination, { recursive: true });
    await writeFile(new URL('greek-mythology.json', destination), JSON.stringify(catalogue, null, 2) + '\n');
    await writeFile(new URL('greek-mythology-layout.json', destination), JSON.stringify(layout) + '\n');
  }
  console.log(JSON.stringify(catalogue.metadata.counts));
}
