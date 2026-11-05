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
 assert.ok(origins('zagreus').some(claim=>isGameTradition(claim.tradition)&&claim.parents.includes('persephone')&&claim.spoiler));
 assert.ok(origins('zagreus').some(claim=>isGameTradition(claim.tradition)&&claim.parents.length===1&&claim.parents[0]==='hades'&&!claim.spoiler));
 const visible=edges.filter(edge=>!edge.spoiler);
 assert.equal(connectedMythologyGroups(catalogue.entities.filter(entity=>!entity.spoiler).map(entity=>entity.id),visible).length,1);
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
 for(const entity of catalogue.entities.filter(entity=>!entity.spoiler))assert.ok(mythologyNeighbors(visible,entity.id).length,entity.id);
});

test('selecting a telling emphasizes its parent sets while preserving the full connected network',async()=>{
 const {traceMythologyEdges}=await import('../src/lib/journal/mythology-map.ts');
 const game=traceMythologyEdges(catalogue,'hades').filter(edge=>!edge.spoiler);
 const orphic=traceMythologyEdges(catalogue,'orphic').filter(edge=>!edge.spoiler);
 const parents=edges=>new Set(edges.filter(edge=>edge.to==='melinoe'&&edge.kind!=='relationship'&&edge.emphasis).map(edge=>edge.from));
 assert.deepEqual(parents(game),new Set(['hades','persephone']));
 assert.deepEqual(parents(orphic),new Set(['zeus','persephone']));
 for(const traced of [game,orphic]){assert.equal(traced.length,972);assert.equal(connectedMythologyGroups(catalogue.entities.filter(entity=>!entity.spoiler).map(entity=>entity.id),traced).length,1);}
});

test('tracing one origin overrides competing parents for that figure only',async()=>{
 const {traceMythologyEdges}=await import('../src/lib/journal/mythology-map.ts');
 const claim=origins('melinoe').find(claim=>!isGameTradition(claim.tradition));
 const traced=traceMythologyEdges(catalogue,'hades',claim.id);
 assert.deepEqual(new Set(traced.filter(edge=>edge.to==='melinoe'&&edge.kind!=='relationship'&&edge.emphasis).map(edge=>edge.from)),new Set(['zeus','persephone']));
 assert.ok(traced.filter(edge=>edge.to==='melinoe'&&edge.from==='hades').every(edge=>!edge.emphasis));
 assert.ok(traced.find(edge=>edge.from==='dora-game'&&edge.to==='melinoe').emphasis,'Other Hades connections keep the selected telling');
});

test('all telling layouts retain the same complete cast and genuinely rearrange positions',()=>{
 for(const reading of ['hesiod','homer','orphic','apollodorus','hades']){
  const view=layout.readings[reading];assert.ok(view,reading);
  assert.deepEqual(new Set(view.nodes.map(node=>node.id)),new Set(layout.nodes.map(node=>node.id)));
  assert.notDeepEqual(view.nodes,layout.nodes,`${reading} must reorder, not merely recolor`);
  for(const node of view.nodes)assert.ok(Number.isFinite(node.x)&&Number.isFinite(node.y));
 }
});

test('release validation leaves the accepted drawing artifact untouched',async()=>{
 const {spawnSync}=await import('node:child_process');
 const {stat}=await import('node:fs/promises');
 const artifact=new URL('../public/journal/greek-mythology-layout.json',import.meta.url);
 const before=await stat(artifact,{bigint:true});
 const result=spawnSync(process.execPath,['scripts/build-mythology-catalogue.mjs','--check'],{cwd:new URL('../',import.meta.url),encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const after=await stat(artifact,{bigint:true});
 assert.equal(after.mtimeNs,before.mtimeNs,'Release validation must preserve the reviewed drawing, not regenerate it on the deployment runtime');
});

test('release validation rejects stale drawing inputs instead of silently accepting them',async()=>{
 const {validateAcceptedDrawing,drawingProvenance}=await import('../scripts/build-mythology-catalogue.mjs');
 const provenance=await drawingProvenance(catalogue);
 validateAcceptedDrawing(catalogue,layout,provenance);
 assert.throws(()=>validateAcceptedDrawing(catalogue,{...layout,provenance:{...provenance,generatorSha256:'outdated'}},provenance),/Drawing inputs changed/);
});

test('the overview orders every attested parent above their child',()=>{
 const points=new Map(layout.nodes.map(node=>[node.id,node]));
 for(const edge of edges.filter(edge=>!edge.spoiler&&edge.kind!=='relationship'))assert.ok(points.get(edge.from).y<points.get(edge.to).y,`${edge.from} must be above ${edge.to}`);
});

test('revealed ancestry and individually traced alternatives also run from top to bottom',()=>{
 for(const view of [layout,...Object.values(layout.readings)])for(const [drawing,visible] of [[view,edges.filter(edge=>!edge.spoiler)],[view.revealed,edges]]){
  const points=new Map(drawing.nodes.map(node=>[node.id,node]));
  for(const edge of visible.filter(edge=>edge.kind!=='relationship'))assert.ok(points.get(edge.from).y<points.get(edge.to).y,`${edge.from} → ${edge.to}`);
 }
});

test('recognizable personal emblems distinguish the principal gods and preserve every smaller name',async()=>{
 const {mythologyEmblem}=await import('../src/lib/journal/mythology-emblems.ts');
 for(const [id,symbol] of [['zeus','bolt'],['poseidon','trident'],['apollo','lyre'],['athena','owl'],['persephone','pomegranate'],['charon','boat'],['hecate','torches'],['melinoe','moon-torch']])assert.equal(mythologyEmblem(byId.get(id)).symbol,symbol);
 for(const entity of catalogue.entities){const emblem=mythologyEmblem(entity);assert.ok(emblem.symbol&&emblem.label);if(!emblem.personal)assert.ok(emblem.monogram);}
 assert.notEqual(mythologyEmblem(byId.get('dora-game')).symbol,'box','Do not disclose Dora’s identity through an emblem');
});

test('small game and ancient graphs use different sourced parent sets and keep the same chosen cast',async()=>{
 const {mythologyComparison,mainMythologyCast}=await import('../src/lib/journal/mythology-comparison.ts');
 const chosen=new Set([...mainMythologyCast,'hyperion','kronos','rhea']);
 const game=mythologyComparison(catalogue,'game',chosen,'all',false);
 const ancient=mythologyComparison(catalogue,'ancient',chosen,'all',false);
 const parents=(graph,id)=>new Set(graph.edges.filter(edge=>edge.to===id&&edge.kind!=='relationship').map(edge=>edge.from));
 assert.deepEqual(parents(game,'demeter'),new Set(['hyperion']));
 assert.deepEqual(parents(ancient,'demeter'),new Set(['kronos','rhea']));
 assert.deepEqual(parents(game,'melinoe'),new Set(['hades','persephone']));
 assert.deepEqual(parents(ancient,'melinoe'),new Set(['zeus','persephone']));
 assert.ok(game.entities.length<60&&ancient.entities.length<60,'Default cast stays manageable');
 assert.ok(ancient.edges.every(edge=>!edge.game));
});

test('cast controls can remove seals, clear the graph and add smaller figures',async()=>{
 const {mythologyComparison,mainMythologyCast}=await import('../src/lib/journal/mythology-comparison.ts');
 const chosen=new Set(mainMythologyCast);chosen.delete('ares');chosen.add('hypnos');
 const graph=mythologyComparison(catalogue,'ancient',chosen,'all',false);
 assert.ok(graph.entities.some(entity=>entity.id==='hypnos'));
 assert.ok(!graph.entities.some(entity=>entity.id==='ares')||graph.connectors.has('ares'),'An unchosen intermediate can only be a small connector');
 assert.equal(mythologyComparison(catalogue,'game',new Set(),'all',false).entities.length,0);
});

test('new game-only spoiler people remain absent until the reader uncovers them',async()=>{
 const {mythologyComparison}=await import('../src/lib/journal/mythology-comparison.ts');
 const chosen=new Set(['persephone','demeter','zeus','persephone-mortal-father-game']);
 const hidden=mythologyComparison(catalogue,'game',chosen,'all',false);
 const revealed=mythologyComparison(catalogue,'game',chosen,'all',true);
 assert.ok(!hidden.entities.some(entity=>entity.id==='persephone-mortal-father-game'));
 assert.ok(!hidden.edges.some(edge=>edge.to==='persephone'&&edge.from==='zeus'),'Do not substitute a known-contradictory ancient father for a covered game origin');
 assert.ok(revealed.entities.some(entity=>entity.id==='persephone-mortal-father-game'));
 assert.ok(revealed.edges.some(edge=>edge.to==='persephone'&&edge.from==='persephone-mortal-father-game'));
 assert.ok(!mythologyComparison(catalogue,'ancient',chosen,'all',true).entities.some(entity=>entity.id==='persephone-mortal-father-game'));
});

test('every catalogue figure has a readable short story and a bounded memorable detail',async()=>{
 const {mythologyStory}=await import('../src/lib/journal/mythology-stories.ts');
 for(const entity of catalogue.entities){const story=mythologyStory(entity,catalogue);assert.ok(story.story.length>35,entity.id);assert.ok(story.detail.length>25,entity.id);assert.ok(!story.story.includes('appears in the cited tradition'),entity.id);assert.ok(!story.story.includes('—'));}
});

test('short stories preserve creation and emergence instead of inventing ordinary births',async()=>{
 const {mythologyStory}=await import('../src/lib/journal/mythology-stories.ts');
 assert.match(mythologyStory(byId.get('cosmic-egg'),catalogue).story,/generated by/);
 assert.match(mythologyStory(byId.get('phanes'),catalogue).story,/emerges from/);
 assert.ok(!mythologyStory(byId.get('cosmic-egg'),catalogue).story.includes('child of'));
});

test('the default small cast keeps both co-parents, even when their seals are not selected',async()=>{
 const {mythologyComparison,mainMythologyCast}=await import('../src/lib/journal/mythology-comparison.ts');
 const graph=mythologyComparison(catalogue,'ancient',new Set(mainMythologyCast),'all',false);
 for(const [child,parents] of [['demeter',['kronos','rhea']],['apollo',['zeus','leto']],['hermes',['zeus','maia-pleiad']],['hecate',['perses-titan','asteria']]])for(const parent of parents)assert.ok(graph.edges.some(edge=>edge.from===parent&&edge.to===child),`${parent} → ${child}`);
});

test('the downloadable catalogue includes the same short stories and memorable details as the profiles',async()=>{
 const {mythologyStory}=await import('../src/lib/journal/mythology-stories.ts');
 for(const entity of catalogue.entities){const profile=mythologyStory(entity,catalogue);assert.equal(entity.shortStory,profile.story,entity.id);assert.equal(entity.rememberThis,profile.detail,entity.id);}
});

test('the default game cast stays connected through Zagreus’s public father without exposing his mother',async()=>{
 const {mythologyComparison,mainMythologyCast}=await import('../src/lib/journal/mythology-comparison.ts');
 const graph=mythologyComparison(catalogue,'game',new Set(mainMythologyCast),'all',false);
 assert.ok(graph.edges.some(edge=>edge.from==='hades'&&edge.to==='zagreus'&&edge.game));
 assert.ok(!graph.edges.some(edge=>edge.from==='persephone'&&edge.to==='zagreus'));
 assert.equal(connectedMythologyGroups(graph.entities.map(entity=>entity.id),graph.edges).length,1);
});

test('Hades starts with Chaos and uses its own attested family and timeline',async()=>{
 const {mythologyComparison,mainMythologyCast}=await import('../src/lib/journal/mythology-comparison.ts');
 const game=mythologyComparison(catalogue,'game',new Set(mainMythologyCast),'hesiod',false);
 const parents=(id)=>game.edges.filter(edge=>edge.to===id&&edge.kind!=='relationship').map(edge=>edge.from);
 const y=(id)=>game.layout.nodes.find(node=>node.id===id)?.y;
 assert.deepEqual(parents('chaos'),[]);
 assert.deepEqual(parents('hades'),['chronos-hades']);
 assert.ok(y('chaos')<y('chronos-hades')&&y('chronos-hades')<y('hades'));
 assert.ok(game.edges.every(edge=>edge.game));
 assert.ok(game.layout.nodes.every(node=>node.id==='chaos'||node.y>y('chaos')));
 assert.ok(game.edges.some(edge=>edge.from==='chaos'&&edge.to==='chronos-hades'&&edge.kind==='relationship'));
 assert.ok(game.edges.some(edge=>edge.from==='demeter'&&edge.to==='poseidon'&&edge.kind==='relationship'));
});

test('choosing Hesiod or the Orphic sources actually changes the origin of Chaos',async()=>{
 const {mythologyComparison,mainMythologyCast}=await import('../src/lib/journal/mythology-comparison.ts');
 const chosen=new Set(['chaos','nyx']);
 const origins=(reading)=>mythologyComparison(catalogue,'ancient',chosen,reading,false).edges.filter(edge=>edge.to==='chaos'&&edge.kind!=='relationship').map(edge=>edge.from);
 assert.deepEqual(origins('hesiod'),[]);
 assert.ok(origins('orphic').includes('chronos-time'));
 const hesiod=mythologyComparison(catalogue,'ancient',new Set(mainMythologyCast),'hesiod',false);
 assert.equal(connectedMythologyGroups(hesiod.entities.map(entity=>entity.id),hesiod.edges).length,1);
});
