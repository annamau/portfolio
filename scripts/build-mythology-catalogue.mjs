import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY } from 'd3-force';
import { mythologyEdges, connectedMythologyGroups } from '../src/lib/journal/mythology-map.ts';
const root = new URL('../', import.meta.url);
const union = (values) => [...new Set(values)];
const refs = (values) => [...new Map(values.map((value) => [`${value.sourceId}:${value.passage}`, value])).values()];
const orderedShards = ['primordials-titans', 'olympians-underworld', 'sea-nymphs-creatures', 'primordial-expansion', 'olympian-expansion', 'nymph-expansion', 'final-gaps', 'atthis-gaps'];
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
  assert.equal(connectedMythologyGroups([...entities.keys()], edges.filter((edge) => !edge.spoiler)).length, 1, 'Spoilers must not hold the network together');
  catalogue.metadata.counts = { entities: entities.size, individualFigures: catalogue.entities.filter((entity) => entity.kind === 'individual').length, collectives: catalogue.entities.filter((entity) => entity.kind === 'collective').length, lineageClaims: catalogue.lineages.length, otherRelationships: catalogue.relationships.length, connections: edges.length, sources: sources.size, connectedGroups: groups.length };
  return catalogue;
}
export function buildLayout(catalogue) {
  const degree = new Map(catalogue.entities.map((entity) => [entity.id, 0])), unique = new Map();
  for (const edge of mythologyEdges(catalogue).filter((edge) => !edge.spoiler)) {
    const key = [edge.from, edge.to].sort().join(':');
    if (unique.has(key)) continue;
    unique.set(key, { source: edge.from, target: edge.to });
    degree.set(edge.from, degree.get(edge.from) + 1); degree.set(edge.to, degree.get(edge.to) + 1);
  }
  const nodes = catalogue.entities.map((entity) => ({ id: entity.id, radius: Math.min(35, 18 + Math.sqrt(degree.get(entity.id)) * 1.7) }));
  const simulation = forceSimulation(nodes)
    .force('links', forceLink([...unique.values()]).id((node) => node.id).distance(180).strength(1))
    .force('charge', forceManyBody().strength(-30))
    .force('collide', forceCollide().radius((node) => Math.max(78, node.radius + 50)).iterations(4))
    .force('x', forceX(0).strength(0.005)).force('y', forceY(0).strength(0.005)).stop();
  simulation.tick(650);
  const positions = nodes.map(({ id, x, y, radius }) => ({ id, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, radius: Math.round(radius) }));
  const minX = Math.min(...positions.map((node) => node.x)) - 100, minY = Math.min(...positions.map((node) => node.y)) - 100;
  const maxX = Math.max(...positions.map((node) => node.x)) + 100, maxY = Math.max(...positions.map((node) => node.y)) + 100;
  return { nodes: positions, bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY } };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const catalogue = await buildCatalogue(), layout = buildLayout(catalogue);
  const destination = new URL('public/journal/', root);
  await mkdir(destination, { recursive: true });
  await writeFile(new URL('greek-mythology.json', destination), JSON.stringify(catalogue, null, 2) + '\n');
  await writeFile(new URL('greek-mythology-layout.json', destination), JSON.stringify(layout) + '\n');
  console.log(JSON.stringify(catalogue.metadata.counts));
}
