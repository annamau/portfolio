import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { projects, getProjectUrl } from "../src/data/projects.ts";

test("project links use the verified production domains", () => {
  const destinations = {
    pediatria: "https://drdariovaldes.com",
    entrena: "https://entrenaconinteligencia.com",
    newssies: "https://newssies.es",
    rebeam: "https://www.rebeam.pro",
  };
  for (const [id, expected] of Object.entries(destinations)) {
    assert.equal(getProjectUrl(projects.find((project) => project.id === id)), expected, id);
  }
});

test("Cometa and Recetanas are browsable projects with local branding", () => {
  for (const [id, destination] of [["cometa", "https://cometa.cards"], ["recetanas", "https://www.recetanas.es"]]) {
    const project = projects.find((entry) => entry.id === id);
    assert.ok(project, id);
    assert.equal(getProjectUrl(project), destination);
    assert.ok(project.taglineEs && project.statusEs && project.roleEs, id);
    assert.ok(existsSync(new URL(`../public${project.logo}`, import.meta.url)), id);
  }
});
