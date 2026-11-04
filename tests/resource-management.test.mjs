import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { createOwnerSession, isOwner, localOwner, passwordMatches, sameOrigin, sessionCookie } from "../src/lib/resources/auth.ts";
import { normalizeResourceUrl, parseDraft, publicResource, savedId } from "../src/lib/resources/model.ts";
import { validateUpload } from "../src/lib/resources/upload.ts";
import { getEntry, listEntries, storageMode, writeEntry } from "../src/lib/resources/store.ts";

const env = { RESOURCE_ADMIN_PASSWORD: "test-only-owner-password-123456" };
const now = Date.UTC(2026,10,4);
const request = (cookie = "", url = "https://portfolio.example/api/resources") => new Request(url, { headers: { cookie } });

test("hosted storage never silently falls back to an ephemeral local directory", () => {
  assert.equal(storageMode({RESOURCE_STORAGE:"netlify",NODE_ENV:"production"}),"netlify");
  assert.equal(storageMode({RESOURCE_STORAGE:"local",NETLIFY:"true"}),"netlify");
  assert.throws(()=>storageMode({NODE_ENV:"production"}),/not configured/);
  assert.throws(()=>storageMode({VERCEL:"1",RESOURCE_STORAGE:"local"}),/not configured/);
  assert.equal(storageMode({RESOURCE_STORAGE:"local",NODE_ENV:"production"}),"local");
});

test("owner access fails closed and rejects forged, expired or rotated sessions", () => {
  assert.equal(isOwner(request(), {}), false);
  assert.equal(passwordMatches(env.RESOURCE_ADMIN_PASSWORD, env), true);
  assert.equal(passwordMatches("wrong-password", env), false);
  const token = createOwnerSession(env, now);
  assert.equal(isOwner(request(`resource_owner=${token}`), env, now), true);
  assert.equal(isOwner(request(`resource_owner=${token.slice(0,-4)}xxxx`), env, now), false);
  assert.equal(isOwner(request(`resource_owner=${token}`), env, now+9*60*60*1000), false);
  assert.equal(isOwner(request(`resource_owner=${token}`), {RESOURCE_ADMIN_PASSWORD:"another-long-password-1234"}, now), false);
  assert.match(sessionCookie(token, true), /HttpOnly.*SameSite=Strict.*Secure/);
});

test("local preview access cannot enable owner access on a hosted deployment", () => {
  const local = request("", "http://127.0.0.1:3091/api/resources");
  assert.equal(localOwner(local, { RESOURCE_LOCAL_OWNER:"1" }), true);
  assert.equal(localOwner(request(), { RESOURCE_LOCAL_OWNER:"1" }), false);
  assert.equal(localOwner(local, { RESOURCE_LOCAL_OWNER:"1", NETLIFY:"true" }), false);
  assert.equal(localOwner(local, { RESOURCE_LOCAL_OWNER:"1", VERCEL:"1" }), false);
  assert.equal(localOwner(local, {}), false);
});

test("mutations require an exact matching browser origin", () => {
  assert.equal(sameOrigin(new Request("https://portfolio.example/api/resources", { headers:{origin:"https://attacker.example"} })), false);
  assert.equal(sameOrigin(request()), false);
  assert.equal(sameOrigin(new Request("https://portfolio.example/api/resources", { headers:{origin:"https://portfolio.example"} })), true);
});

test("capture strips X tracking parameters and deduplicates equivalent links", () => {
  const a=normalizeResourceUrl("https://twitter.com/PostHog/status/2117671104852754456?a=tracking&s=46");
  const b=normalizeResourceUrl("https://x.com/posthog/status/2117671104852754456");
  assert.equal(a,b);
  assert.equal(savedId(a),savedId(b));
  assert.equal(normalizeResourceUrl("https://example.com/docs#section"),"https://example.com/docs#section");
  for (const url of ["javascript:alert(1)","http://example.com","https://localhost/x","https://127.0.0.1/x","https://192.168.0.1/x","https://user:password@example.com","https://example.com?token=secret"]) assert.throws(()=>normalizeResourceUrl(url),undefined,url);
});

test("draft validation ignores injected publishing state and public data excludes private notes", () => {
  const input = { url:"https://example.com", name:"Example", category:"ideas", tags:["Images","Images"], description:"A useful example", privateNotes:"PRIVATE-NOTE-SENTINEL", status:"published", preview:"javascript:alert(1)" };
  const parsed=parseDraft(input);
  assert.deepEqual(parsed.tags,["Images"]);
  assert.equal(parsed.status,undefined);
  assert.equal(parsed.preview,undefined);
  const published=publicResource({...parsed,id:savedId(parsed.url),status:"published",version:1,updatedAt:new Date().toISOString()});
  assert.doesNotMatch(JSON.stringify(published),/PRIVATE-NOTE-SENTINEL|privateNotes|"status"|"version"/);
  assert.throws(()=>parseDraft({...input,category:"unknown"}));
  assert.throws(()=>parseDraft({...input,kind:"script"}));
  assert.throws(()=>parseDraft({...input,tags:Array.from({length:21},(_,i)=>`tag${i}`)}));
});

test("uploads validate file bytes and reject active content, spoofed types and oversized files", async () => {
  const png=await sharp({create:{width:2,height:2,channels:3,background:"#df4f2f"}}).png().toBuffer();
  const image=await validateUpload(new File([png],"test.png",{type:"image/png"}));
  assert.equal(image.contentType,"image/webp");
  assert.equal(image.kind,"image");
  for(const file of [new File(["<svg onload='alert(1)'/>"],"unsafe.svg",{type:"image/svg+xml"}),new File(["<script>alert(1)</script>"],"fake.png",{type:"image/png"}),new File([new Uint8Array(4*1024*1024+1)],"large.mp4",{type:"video/mp4"})]) await assert.rejects(validateUpload(file));
});

test("saved resources survive reads and stale updates cannot overwrite newer data", async () => {
  const previous=process.env.RESOURCE_DATA_DIR;
  const directory=await mkdtemp(join(tmpdir(),"portfolio-resource-store-test-"));
  process.env.RESOURCE_DATA_DIR=directory;
  try {
    const parsed=parseDraft({url:"https://store-test.example",name:"Persistent",privateNotes:"owner only"});
    const id=savedId(parsed.url);
    const entry={...parsed,id,status:"draft",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),version:1};
    await writeEntry(entry,0);
    assert.equal((await getEntry(id)).name,"Persistent");
    assert.equal((await listEntries()).length,1);
    await assert.rejects(writeEntry({...entry,name:"stale",version:2},0),/changed in another tab/);
    await writeEntry({...entry,name:"Updated",version:2},1);
    assert.equal((await getEntry(id)).name,"Updated");
  } finally {
    if(previous===undefined)delete process.env.RESOURCE_DATA_DIR;else process.env.RESOURCE_DATA_DIR=previous;
    await rm(directory,{recursive:true,force:true});
  }
});

test("origin checks use the browser-facing Host when Next normalizes loopback URLs",()=>{
 assert.equal(sameOrigin(new Request("http://localhost:3091/api/resources",{headers:{host:"127.0.0.1:3091",origin:"http://127.0.0.1:3091"}})),true);
 assert.equal(sameOrigin(new Request("http://localhost:3091/api/resources",{headers:{host:"127.0.0.1:3091",origin:"https://attacker.example"}})),false);
});
