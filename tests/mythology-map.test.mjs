import assert from 'node:assert/strict';
import test from 'node:test';
import {mythologyMap} from '../src/lib/journal/mythology-map.ts';

function flatten(node,parent=null){return [{...node,parent},...(node.children||[]).flatMap(child=>flatten(child,node.id))];}

test('one connected map includes the earlier family branches and every figure in the field guide',()=>{
 const nodes=flatten(mythologyMap);const byId=new Map(nodes.map(node=>[node.id,node]));
 assert.equal(byId.size,nodes.length,'A figure must not accidentally be duplicated into separate trees.');
 for(const node of nodes){assert.ok(node.role.trim());let cursor=node;const visited=new Set();while(cursor.parent){assert.ok(!visited.has(cursor.id),'No parent cycles');visited.add(cursor.id);cursor=byId.get(cursor.parent);assert.ok(cursor,'Every connector has a displayed parent');}assert.equal(cursor.id,'first-beings');}
 const names=new Set(nodes.flatMap(node=>node.name.split(' + ')));
 for(const name of ['Chaos','Gaia','Uranus','Cronus','Rhea','Nyx','Moros','Thanatos','Hypnos','Eris','Zeus','Poseidon','Hera','Demeter','Hades','Hestia','Apollo','Helios','Artemis','Selene','Athena','Ares','Aphrodite','Dionysus','Hephaestus','Hermes','Hecate','Charon','Scylla','Harpies'])assert.ok(names.has(name),`${name} belongs in the combined map`);
});

test('connecting every branch never invents kinship for the first beings, ferryman or sea monster',()=>{
 const nodes=flatten(mythologyMap);const find=id=>nodes.find(node=>node.id===id);
 assert.equal(find('chaos').edge,'context');assert.equal(find('gaia').edge,'context');
 assert.equal(find('gaia').parent,'first-beings');assert.equal(find('nyx').parent,'chaos');
 assert.equal(find('charon').edge,'context');assert.equal(find('charon').parent,'underworld');
 assert.equal(find('scylla').edge,'context');assert.equal(find('scylla').parent,'sea');
 assert.equal(find('aphrodite').edge,'emergence');assert.match(find('aphrodite').relation,/sea foam/);
 assert.match(find('athena').relation,/Metis/);assert.match(find('hephaestus').relation,/Hera alone/);
 assert.match(find('harpies').relation,/Electra/);assert.match(find('hecate').relation,/Perses/);
});
