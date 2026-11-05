import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {newPost,updatePost,publicPost} from '../src/lib/journal/model.ts';
import {getPost,listPosts,savePost} from '../src/lib/journal/store.ts';
const content={title:'A game, a question',body:'Some thoughts.\n\n# A heading\n\nMore thoughts.',topic:'Games'};
test('journal entries start private, have stable unique URLs and validate content',()=>{
 const post=newPost({...content,status:'published',slug:'attacker',version:99});
 assert.equal(post.status,'draft');assert.equal(post.version,1);assert.match(post.slug,/^a-game-a-question-[a-f0-9]{8}$/);
 assert.notEqual(newPost(content).slug,post.slug);
 assert.throws(()=>newPost({...content,body:' '}));assert.throws(()=>newPost({...content,cover:'javascript:alert(1)'}));
 const live=updatePost(post,{...content,title:'Updated',action:'publish',version:1});
 assert.equal(live.slug,post.slug);assert.equal(live.status,'published');assert.ok(live.publishedAt);
 assert.equal('version' in publicPost(live),false);assert.equal('status' in publicPost(live),false);
 assert.throws(()=>updatePost(live,{...content,action:'unpublish',version:1}),error=>error.status===409);
 const draft=updatePost(live,{action:'unpublish',version:2});assert.equal(draft.status,'draft');assert.equal(draft.body,content.body);
});
test('journal drafts persist separately and reject stale writes',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'portfolio-journal-'));const old={...process.env};
 process.env.RESOURCE_DATA_DIR=directory;process.env.RESOURCE_STORAGE='local';delete process.env.NETLIFY;delete process.env.NETLIFY_BLOBS_CONTEXT;
 try{
  const post=newPost(content);await savePost(post);assert.deepEqual(await getPost(post.id),post);assert.deepEqual(await listPosts(),[post]);
  const live=updatePost(post,{...content,action:'publish',version:1});await savePost(live,1);
  await assert.rejects(()=>savePost(live,1),error=>error.status===409);
  assert.equal((await getPost(post.id)).status,'published');assert.equal(await getPost('../private'),null);
 }finally{process.env=old;await rm(directory,{recursive:true,force:true});}
});
