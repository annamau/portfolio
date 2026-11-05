import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { buildCatalogue } from '../scripts/build-mythology-catalogue.mjs';
import { mythologyEdges, connectedMythologyGroups, searchMythology, isGameTradition, adjacentMythologyId, mythologyFocus, mythologyNeighbors } from '../src/lib/journal/mythology-map.ts';
const catalogue = JSON.parse(await readFile(new URL('../public/journal/greek-mythology.json', import.meta.url)));
const layout = JSON.parse(await readFile(new URL('../public/journal/greek-mythology-layout.json', import.meta.url)));
const byId = new Map(catalogue.entities.map(entity => [entity.id, entity]));
const edges = mythologyEdges(catalogue);
const origins = id => catalogue.lineages.filter(claim => claim.child === id);

test('the published JSON is reproducibly assembled from the cited research records', async () => {
 assert.deepEqual(await buildCatalogue(), catalogue);
 assert.equal(catalogue.entities.length, byId.size);
 for(const record of [...catalogue.entities,...catalogue.lineages,...catalogue.relationships,...catalogue.coverage]) {
  assert.ok(record.sourceRefs.length);
  for(const ref of record.sourceRefs) {assert.ok(catalogue.sources.some(source=>source.id===ref.sourceId));assert.ok(ref.passage.trim());}
 }
});

test('every figure has one node and every connection has two existing endpoints',()=>{
 assert.ok(byId.size>400, 'Broad catalogue rather than the old selected 40-node list');
 for(const id of ['chaos','gaia','nyx','zeus','hera','kronos','rhea','leto','maia-pleiad','apollo','artemis','aphrodite','melinoe','zagreus','charon','harpies','aello-harpy','ocypete-harpy','nereids','oceanids','nymphs','dusa-game','dora-game'])assert.ok(byId.has(id),id);
 for(const entity of catalogue.entities)assert.ok(!entity.name.includes(' + '),'Couples are separate people');
 for(const edge of edges){assert.ok(byId.has(edge.from),edge.from);assert.ok(byId.has(edge.to),edge.to);assert.notEqual(edge.from,edge.to);}
 assert.equal(new Set(edges.map(edge=>edge.id)).size,edges.length);
 assert.equal(connectedMythologyGroups([...byId.keys()],edges).length,1);
});

test('both parents get actual connections, including the co-parents lost by the old tree',()=>{
 for(const [child,parents] of [['apollo',['zeus','leto']],['artemis',['zeus','leto']],['hermes',['zeus','maia-pleiad']],['hecate',['perses-titan','asteria']]]){
  assert.ok(origins(child).some(claim=>parents.every(parent=>claim.parents.includes(parent))),child);
  for(const parent of parents)assert.ok(edges.some(edge=>edge.from===parent&&edge.to===child),`${parent} → ${child}`);
 }
 assert.ok(origins('maia-pleiad').some(claim=>claim.parents.includes('atlas')&&claim.parents.includes('pleione')));
});

test('different Aphrodite and Melinoe parent sets stay attributed, never fused',()=>{
 const aphrodite=origins('aphrodite');
 assert.ok(aphrodite.some(claim=>claim.mode==='emergence'&&claim.parents.length===1&&claim.parents[0]==='uranus'));
 assert.ok(aphrodite.some(claim=>claim.parents.includes('zeus')&&claim.parents.includes('dione-homer')));
 assert.ok(!aphrodite.some(claim=>claim.parents.includes('uranus')&&claim.parents.includes('zeus')));
 const melinoe=origins('melinoe');
 assert.ok(melinoe.some(claim=>!isGameTradition(claim.tradition)&&claim.parents.includes('zeus')&&claim.parents.includes('persephone')));
 assert.ok(melinoe.some(claim=>isGameTradition(claim.tradition)&&claim.parents.includes('hades')&&claim.parents.includes('persephone')));
 assert.ok(byId.has('dione-oceanid')&&byId.has('dione-homer'));
});

test('the first beings and uncertain identities never gain invented biological parents',()=>{
 assert.ok(!edges.some(edge=>edge.from==='chaos'&&edge.to==='gaia'&&edge.kind==='birth'));
 assert.ok(catalogue.relationships.some(claim=>claim.from==='chaos'&&claim.to==='gaia'&&claim.type==='precedes'));
 assert.notEqual(byId.get('kronos'),byId.get('chronos-time'));
 assert.ok(!catalogue.relationships.some(claim=>claim.from==='dusa-game'&&claim.to==='medusa'&&claim.type==='identified_with'));
 assert.ok(!origins('charon').some(claim=>!isGameTradition(claim.tradition)),'No ancient Nyx/Erebus parentage invented for Charon');
 assert.ok(origins('cosmic-egg').every(claim=>claim.mode==='creation'));
});

test('character reveal edges stay hidden without disconnecting the graph',()=>{
 const secret=catalogue.relationships.find(claim=>claim.from==='dora-game'&&claim.to==='pandora');
 assert.ok(secret.spoiler);
 assert.ok(origins('zagreus').filter(claim=>isGameTradition(claim.tradition)).every(claim=>claim.spoiler));
 const visible=edges.filter(edge=>!edge.spoiler);
 assert.equal(connectedMythologyGroups([...byId.keys()],visible).length,1);
 assert.ok(!visible.some(edge=>edge.from==='dora-game'&&edge.to==='pandora'));
 assert.ok(visible.some(edge=>edge.from==='dora-game'&&edge.to==='melinoe'));
});

test('enumerated groups and corrected Hamadryad passages retain precise coverage',()=>{
 for(const group of catalogue.coverage){if(group.expected!==null)assert.equal(group.entityIds.length,group.expected,group.group);for(const id of group.entityIds)assert.ok(byId.has(id));}
 const all=JSON.stringify(catalogue);
 assert.ok(!all.includes('1.78a'),'Athenaeus reference was corrected to book 3');
 assert.ok(all.includes('3.78b'));
 const nereids=catalogue.coverage.find(group=>/nereids/i.test(group.group)&&group.entityIds.length===51);
 assert.ok(nereids,'Keep all named Nereids, explain the fifty vs 51 discrepancy');
});

test('every entity has a finite drawing position and circles do not overlap',()=>{
 assert.equal(layout.nodes.length,byId.size);
 for(let i=0;i<layout.nodes.length;i++){
  const node=layout.nodes[i];assert.ok(byId.has(node.id));assert.ok(Number.isFinite(node.x)&&Number.isFinite(node.y));
  for(const other of layout.nodes.slice(i+1))assert.ok(Math.hypot(node.x-other.x,node.y-other.y)>node.radius+other.radius,`${node.id}/${other.id}`);
 }
});

test('search supports accents, aliases and domains as entry points',()=>{
 assert.equal(searchMythology(catalogue.entities,'melinoe')[0].id,'melinoe');
 assert.ok(searchMythology(catalogue.entities,'night').some(entity=>entity.id==='nyx'));
 assert.equal(searchMythology(catalogue.entities,'harpies')[0].id,'harpies');
 assert.deepEqual(searchMythology(catalogue.entities,' '),[]);
});


test('namesakes have distinct readable search identities',()=>{
 const matches=searchMythology(catalogue.entities,'arethusa');
 assert.equal(matches.length,2);
 assert.ok(matches.every(entity=>entity.qualifier));
 assert.equal(new Set(matches.map(entity=>entity.qualifier)).size,2);
});

test('keyboard traversal can reach every figure and return in both directions',()=>{
 let current=catalogue.entities[0].id;const visited=new Set();
 for(let i=0;i<catalogue.entities.length;i++){visited.add(current);current=adjacentMythologyId(catalogue.entities,current,1);}
 assert.equal(visited.size,catalogue.entities.length);assert.equal(current,catalogue.entities[0].id);
 assert.equal(adjacentMythologyId(catalogue.entities,current,-1),catalogue.entities.at(-1).id);
});

test('phone and desktop focus frames contain every displayed parent alongside the selected figure',()=>{
 for(const aspect of [.6,1.4])for(const selected of ['apollo','hecate','melinoe','chaos','scylla']){
  const frame=mythologyFocus(layout,edges.filter(edge=>!edge.spoiler),selected,aspect);
  const ids=new Set([selected,...edges.filter(edge=>!edge.spoiler&&edge.kind!=='relationship'&&edge.to===selected).map(edge=>edge.from)]);
  for(const node of layout.nodes.filter(node=>ids.has(node.id))){assert.ok(node.x>frame.x&&node.x<frame.x+frame.width,node.id);assert.ok(node.y>frame.y&&node.y<frame.y+frame.height,node.id);}
 }
 assert.ok(byId.get('chaos').originNotes.some(note=>note.tradition==='Hesiod'&&note.summary.includes('No parent')));
});


test('connection navigation offers actual neighbors, including both parents, without spoiler shortcuts',()=>{
 const visible=edges.filter(edge=>!edge.spoiler);
 assert.ok(mythologyNeighbors(visible,'apollo').includes('zeus'));
 assert.ok(mythologyNeighbors(visible,'apollo').includes('leto'));
 assert.ok(mythologyNeighbors(visible,'chaos').includes('erebus'));
 assert.ok(!mythologyNeighbors(visible,'dora-game').includes('pandora'));
 for(const entity of catalogue.entities)assert.ok(mythologyNeighbors(visible,entity.id).length,entity.id);
});
