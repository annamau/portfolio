import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {newSuggestion} from '../src/lib/resources/suggestions.ts';
import {listSuggestions,saveSuggestion,reviewSuggestion,takeSuggestionSlot} from '../src/lib/resources/suggestion-store.ts';

test('visitor suggestions accept ideas and links but never caller publication or private data',()=>{
 const idea=newSuggestion({title:'More accessible tools',note:'Add a collection of accessibility tools.',status:'published',privateNotes:'injected'});
 assert.equal(idea.url,'');assert.equal(idea.status,'pending');assert.equal(idea.category,'ideas');assert.equal('privateNotes' in idea,false);
 assert.equal(newSuggestion({title:'Clerk',note:'Authentication tools',url:'https://clerk.com/?utm_source=spam'}).url,'https://clerk.com');
 for(const input of [{title:' ',note:'x'},{title:'x',note:''},{title:'x',note:'x',url:'javascript:alert(1)'},{title:'x',note:'x',category:'secret'}])assert.throws(()=>newSuggestion(input));
});

test('suggestions persist separately, reject stale reviews, restore archives and enforce a shared hourly cap',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'resource-suggestions-'));const old={...process.env};
 process.env.RESOURCE_DATA_DIR=directory;process.env.RESOURCE_STORAGE='local';delete process.env.NETLIFY;delete process.env.NETLIFY_BLOBS_CONTEXT;
 try{
  const idea=newSuggestion({title:'An idea',note:'PRIVATE-SUGGESTION'});await saveSuggestion(idea);
  assert.deepEqual(await listSuggestions(),[idea]);
  await reviewSuggestion(idea.id,1,'archived');await assert.rejects(()=>reviewSuggestion(idea.id,1,'reviewed'),error=>error.status===409);
  await reviewSuggestion(idea.id,2,'pending');assert.equal((await listSuggestions())[0].status,'pending');
  for(let index=0;index<50;index++)await takeSuggestionSlot();
  await assert.rejects(()=>takeSuggestionSlot(),error=>error.status===429);
 }finally{process.env=old;await rm(directory,{recursive:true,force:true});}
});
