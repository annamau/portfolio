import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resources, resourceCollections } from "../src/data/resources.ts";
import { resourcePreviews } from "../src/data/resource-media.ts";
import { filterResources } from "../src/lib/resource-search.ts";

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
