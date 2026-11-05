import assert from 'node:assert/strict';
import test from 'node:test';
import {pageDetails,linkPreview} from '../src/lib/resources/link-preview.ts';
import sharp from 'sharp';
import {publicAddress,readPublicResource,readPublicBody} from '../src/lib/resources/public-page.ts';
import {captureReducer,captureState} from '../src/lib/resources/capture-prefill.ts';

const url='https://example.com/charts';
const details={name:'Tinycharts',description:'Interactive hand-drawn charts.',category:'design',kind:'tool',tags:['Charts','Diagrams'],image:'https://example.com/og.png'};
const blank=()=>captureState({url,name:'',description:'',category:'ideas',kind:'tool',tags:'',image:''});

test('ordinary page metadata fills title, decoded description, image and sensible editable suggestions',()=>{
 const html=Buffer.from(`<html><head><title>Fallback</title><meta content="Tinycharts" property="og:title"><meta name="description" content="Hand-drawn charts &amp; diagrams for Claude skills."><meta property="og:image" content="/preview.png"><meta name="keywords" content="Statecharts, Interactive"></head><body><main><h1>Tinycharts</h1><p>Create hand-drawn charts with a Claude skill.</p></main><script>Database SQL marketing SEO</script></body></html>`);
 const result=pageDetails(html,url);assert.equal(result.name,'Tinycharts');assert.equal(result.description,'Hand-drawn charts & diagrams for Claude skills.');assert.equal(result.image,'https://example.com/preview.png');assert.equal(result.category,'design');assert.equal(result.kind,'tool');assert.ok(result.tags.includes('Charts')&&result.tags.includes('Skills'));assert.ok(!result.tags.includes('Database'));
 const unsafe=pageDetails(Buffer.from('<title>A page</title><meta property="og:image" content="http://localhost/private.png">'),url);assert.equal(unsafe.image,'');
});

test('in-flight suggestions preserve owner edits and cannot apply to another link',()=>{
 let state=blank();state=captureReducer(state,{type:'edit',field:'name',value:'My own title'});state=captureReducer(state,{type:'edit',field:'category',value:'marketing'});
 state=captureReducer(state,{type:'prefill',url,details});assert.equal(state.fields.name,'My own title');assert.equal(state.fields.category,'marketing');assert.equal(state.fields.description,details.description);assert.equal(state.fields.image,details.image);
 state=captureReducer(state,{type:'edit',field:'url',value:'https://example.com/audio'});assert.equal(state.fields.description,'');assert.equal(state.fields.image,'');assert.equal(state.fields.name,'My own title');
 const before=state;state=captureReducer(state,{type:'prefill',url,details});assert.deepEqual(state,before);
});

test('adding harmless surrounding whitespace does not clear details for the same link',()=>{
 let state=captureReducer(blank(),{type:'prefill',url,details});state=captureReducer(state,{type:'edit',field:'url',value:` ${url}\n`});assert.equal(state.fields.name,details.name);assert.equal(state.fields.image,details.image);
});

test('metadata cannot replace existing entry fields or a specifically selected folder',()=>{
 let state=captureState({...blank().fields,name:'Saved name',category:'development',kind:'learning'},true);
 state=captureReducer(state,{type:'prefill',url,details});assert.equal(state.fields.name,'Saved name');assert.equal(state.fields.category,'development');assert.equal(state.fields.kind,'learning');
});

test('public page reads reject private, mapped, reserved and mixed DNS answers before requesting content',async()=>{
 for(const address of ['127.0.0.1','10.0.0.1','172.16.0.1','192.168.1.1','169.254.169.254','100.64.0.1','0.0.0.0','198.18.0.1','224.0.0.1','::1','fe80::1','fd00::1','::ffff:127.0.0.1','2001:db8::1','2002:c0a8:101::1'])assert.equal(publicAddress(address),false,address);
 for(const address of ['1.1.1.1','8.8.8.8','2606:4700:4700::1111'])assert.equal(publicAddress(address),true,address);
 let requests=0;
 await assert.rejects(readPublicResource(url,'page',{resolve:async()=>[{address:'1.1.1.1',family:4},{address:'127.0.0.1',family:4}],read:async()=>{requests++;}}),/public address/);assert.equal(requests,0);
});

test('each redirect gets a fresh checked DNS answer and cannot enter a private network',async()=>{
 const resolved=[];let requests=0;
 await assert.rejects(readPublicResource(url,'page',{resolve:async(host)=>{resolved.push(host);return [{address:host==='example.com'?'1.1.1.1':'10.0.0.1',family:4}];},read:async(_url,address)=>{assert.equal(address.address,'1.1.1.1');requests++;return {status:302,location:'https://private.example.com/data',contentType:'text/html',body:Buffer.alloc(0)};}}),/public address/);
 assert.equal(requests,1);assert.deepEqual(resolved,['example.com','private.example.com']);
});

test('page bodies are bounded and oversized images are rejected before persistence',async()=>{
 async function* large(){yield Buffer.alloc(300*1024);yield Buffer.alloc(300*1024);}
 assert.equal((await readPublicBody(large(),'page')).length,512*1024);
 async function* image(){yield Buffer.alloc(4*1024*1024);yield Buffer.alloc(1);}
 await assert.rejects(readPublicBody(image(),'image'),/too large/);
});

test('the form receives a sanitized local image preview, not an automatic remote browser image request',async()=>{
 const png=await sharp({create:{width:3,height:3,channels:3,background:'#b83c25'}}).png().toBuffer();
 const result=await linkPreview(url,async(target,kind)=>({url:target,contentType:kind==='image'?'image/png':'text/html',body:kind==='image'?png:Buffer.from('<title>Charts</title><meta property="og:image" content="/cover.png">')}));
 assert.equal(result.image,'https://example.com/cover.png');assert.ok(result.thumbnail.startsWith('data:image/webp;base64,'));
 const decoded=await sharp(Buffer.from(result.thumbnail.split(',')[1],'base64')).metadata();assert.equal(decoded.format,'webp');assert.ok(decoded.width<=320&&decoded.height<=180);
});

test('an unavailable page image still returns editable website details',async()=>{
 const result=await linkPreview(url,async(target,kind)=>{if(kind==='image')throw new Error('Blocked image');return {url:target,contentType:'text/html',body:Buffer.from('<title>Charts</title><meta name="description" content="Useful diagrams."><meta property="og:image" content="/cover.png">')};});
 assert.equal(result.name,'Charts');assert.equal(result.description,'Useful diagrams.');assert.equal(result.image,'');assert.equal(result.thumbnail,'');
});
