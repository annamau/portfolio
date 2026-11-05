import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resources, resourceCollections } from "../src/data/resources.ts";
import { resourcePreviews } from "../src/data/resource-media.ts";
import { fallbackThumbnail, resourceThumbnail } from "../src/lib/resource-thumbnail.ts";
import { filterResources } from "../src/lib/resource-search.ts";

test("every curated resource has an image thumbnail", () => {
  assert.deepEqual(resources.filter(({id})=>!resourcePreviews[id]).map(({id})=>id),[]);
});

test("published resource previews are local WebP files belonging to curated resources", () => {
  const resourceIds = new Set(resources.map(({ id }) => id));
  assert.ok(Object.keys(resourcePreviews).length > 0);
  for (const [id, path] of Object.entries(resourcePreviews)) {
    assert.ok(resourceIds.has(id), id);
    assert.match(path, /^\/resources\/previews\/[a-z0-9-]+\.webp$/, id);
    const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
    assert.equal(bytes.subarray(0, 4).toString(), "RIFF", id);
    assert.equal(bytes.subarray(8, 12).toString(), "WEBP", id);
  }
});

test("Evolution API uses its current documentation destination", () => {
  assert.equal(resources.find(({ id }) => id === "evolution").url, "https://docs.evolutionfoundation.com.br/");
});

test("public library excludes private destinations and account-specific URLs", () => {
  const categories = new Set(resourceCollections.map(({ id }) => id));
  const ids = new Set();
  const urls = new Set();
  for (const resource of resources) {
    const url = new URL(resource.url);
    assert.equal(url.protocol, "https:", resource.name);
    assert.equal(url.username + url.password + url.search + url.hash, "", resource.name);
    assert.doesNotMatch(url.hostname, /localhost|\.local$|sslip\.io|^\d+\.\d+\.\d+\.\d+$/, resource.name);
    assert.doesNotMatch(url.pathname, /\/(dashboard|admin|account|project|notebook)\//, resource.name);
    assert.ok(categories.has(resource.category), resource.name);
    assert.ok(resource.description.en && resource.description.es, resource.name);
    assert.ok(!ids.has(resource.id) && !urls.has(resource.url), resource.name);
    ids.add(resource.id);
    urls.add(resource.url);
  }
  for (const { id } of resourceCollections) assert.ok(filterResources(resources, { category: id }).length > 0, id);
});

test("search matches names, topics and Spanish text without case or accent sensitivity", () => {
  assert.deepEqual(filterResources(resources, { query: "  PHOSPHOR  " }).map(({ id }) => id), ["phosphor"]);
  assert.ok(filterResources(resources, { query: "busqueda" }).some(({ id }) => id === "exa"));
  assert.ok(filterResources(resources, { query: "BÚSQUEDA" }).some(({ id }) => id === "exa"));
  assert.ok(filterResources(resources, { query: "react animation" }).some(({ id }) => id === "aceternity"));
});

test("developer shorthand and media searches find the intended resources", () => {
  assert.ok(filterResources(resources, { query: "db" }).some(({ id }) => id === "supabase"));
  assert.ok(filterResources(resources, { tag: "images" }).some(({ id }) => id === "unsplash"));
  assert.ok(filterResources(resources, { query: "imágenes" }).some(({ id }) => id === "phosphor"));
  assert.ok(filterResources(resources, { query: "sound" }).some(({ id }) => id === "remotion"));
});

test("category, topic and search compose, including an empty result", () => {
  const result = filterResources(resources, { category: "development", tag: "React", query: "UI" });
  assert.ok(result.length > 0);
  assert.ok(result.every((resource) => resource.category === "development" && resource.tags.includes("React")));
  assert.deepEqual(filterResources(resources, { category: "marketing", query: "Phosphor" }), []);
  assert.equal(filterResources(resources, {}).length, resources.length);
});

test("alphabetical order does not mutate the editorial catalogue", () => {
  const originalIds = resources.map(({ id }) => id);
  const result = filterResources(resources, { sort: "az" });
  assert.deepEqual(result.map(({ name }) => name), [...result.map(({ name }) => name)].sort((a, b) => a.localeCompare(b)));
  assert.deepEqual(resources.map(({ id }) => id), originalIds);
});


test("new and broken links always have a local thumbnail without a third-party request", () => {
  const clerk={...resources[0],id:"saved-clerk",name:"Clerk",url:"https://clerk.com"};
  const fallback=resourceThumbnail(clerk);
  assert.match(fallback,/^data:image\/svg\+xml,/);
  assert.match(decodeURIComponent(fallback),/>Clerk</);
  assert.match(decodeURIComponent(fallback),/>clerk.com</);
  assert.equal(resourceThumbnail(resources[0]),resourcePreviews[resources[0].id]);
  assert.equal(resourceThumbnail({...clerk,preview:"/api/resources/media/private/cover"}),"/api/resources/media/private/cover");
  assert.equal(resourceThumbnail({...clerk,preview:"/api/resources/media/private/cover"},true),fallback);
});

test("thumbnail labels safely escape source text and support uploaded files", () => {
  const image=fallbackThumbnail({...resources[0],name:'A <script> & "quotes"',url:"/api/resources/media/file/asset"});
  const svg=decodeURIComponent(image.split(",")[1]);
  assert.doesNotMatch(svg,/<script>|onload=/);
  assert.match(svg,/&lt;script&gt;/);
  assert.match(svg,/&amp;/);
  assert.match(svg,/>Saved file</);
});
