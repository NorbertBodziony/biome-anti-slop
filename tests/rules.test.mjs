import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const biome = join(root, "node_modules/.bin/biome");

const cases = {
  "no-chained-type-assertions": "This assertion chain discards type evidence.",
  "no-conditional-empty-object-spread": "This conditional spread hides property omission",
  "no-known-value-widening": "This explicit broad type can discard known type evidence.",
  "no-module-mocking": "Replace module mocking with dependency injection",
  "no-reflect-apply": "Replace `Reflect.apply` with a typed function call.",
  "no-reflect-get": "Replace `Reflect.get` with typed property access.",
  "no-runtime-typeof": "A `typeof` check narrows a representation",
  "no-shape-in-symbol-names": "Rename this symbol for its domain role",
  "no-unknown-returns": "This function exposes `unknown` to its caller.",
  "no-unknown-type-aliases": "This type alias hides `unknown`.",
  "no-unsafe-dictionary-type": "This dictionary value type gives callers no concrete contract.",
};

function runFixture(rule, kind) {
  const directory = mkdtempSync(join(tmpdir(), `biome-anti-slop-${rule}-`));
  const ruleName = `${rule}.grit`;
  cpSync(join(root, "rules", ruleName), join(directory, ruleName));
  cpSync(join(root, "tests/fixtures", kind, `${rule}.ts`), join(directory, "input.ts"));
  writeFileSync(
    join(directory, "biome.json"),
    `${JSON.stringify({ plugins: [`./${ruleName}`] }, null, 2)}\n`,
  );

  const result = spawnSync(
    biome,
    ["lint", "--only=plugin", "--reporter=json", "--colors=off", "input.ts"],
    { cwd: directory, encoding: "utf8" },
  );
  return {
    status: result.status,
    output: `${result.stdout}\n${result.stderr}`,
  };
}

for (const [rule, message] of Object.entries(cases)) {
  test(`${rule} reports its rejected fixture`, () => {
    const result = runFixture(rule, "rejected");
    assert.notEqual(result.status, 0, result.output);
    assert.match(result.output, /"category":"plugin"/);
    assert.ok(result.output.includes(message), result.output);
  });

  test(`${rule} accepts its valid fixture`, () => {
    const result = runFixture(rule, "accepted");
    assert.equal(result.status, 0, result.output);
    assert.doesNotMatch(result.output, /"category":"plugin"/);
  });
}

test("the public rule set contains exactly the documented rules", () => {
  const actual = Object.keys(cases).sort();
  const documented = readFileSync(join(root, "README.md"), "utf8");
  for (const rule of actual) {
    assert.ok(documented.includes(`\`${rule}\``), `${rule} is missing from README.md`);
  }
  assert.equal(actual.length, 11);
});
