import assert from "node:assert/strict";
import { type SpawnSyncReturns, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const installer = join(root, "skills/biome-anti-slop/scripts/install.js");

function createRepository(): string {
  return mkdtempSync(join(tmpdir(), "biome-anti-slop-install-"));
}

function install(repository: string, ...arguments_: string[]): SpawnSyncReturns<string> {
  return spawnSync("node", [installer, ...arguments_], {
    cwd: repository,
    encoding: "utf8",
  });
}

function installedRules(repository: string, destination = "tools/biome/anti-slop"): string[] {
  return readdirSync(join(repository, destination, "rules"))
    .filter((name) => name.endsWith(".grit"))
    .sort();
}

test("installer copies all rules to the default destination", () => {
  const repository = createRepository();
  const result = install(repository);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(installedRules(repository).length, 11);
});

test("installer supports a custom relative destination", () => {
  const repository = createRepository();
  const result = install(repository, "config/biome/anti-slop");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(installedRules(repository, "config/biome/anti-slop").length, 11);
});

test("installer refuses to overwrite without force", () => {
  const repository = createRepository();
  assert.equal(install(repository).status, 0);
  const second = install(repository);
  assert.equal(second.status, 1);
  assert.match(second.stderr, /Refusing to overwrite/);
});

test("installer force replaces the exact destination", () => {
  const repository = createRepository();
  assert.equal(install(repository).status, 0);
  const marker = join(repository, "tools/biome/anti-slop/local-marker.txt");
  writeFileSync(marker, "local");
  const forced = install(repository, "--force");
  assert.equal(forced.status, 0, forced.stderr);
  assert.equal(existsSync(marker), false);
  assert.equal(installedRules(repository).length, 11);
});

test("installer rejects destinations outside the repository", () => {
  const repository = createRepository();
  const result = install(repository, "../outside");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /inside the target repository/);
});
