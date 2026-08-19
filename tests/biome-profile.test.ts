import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const biome = join(root, "node_modules/.bin/biome");

test("native anti-slop profile enables all required Biome rules as errors", () => {
  const directory = mkdtempSync(join(tmpdir(), "biome-anti-slop-profile-"));
  writeFileSync(
    join(directory, "biome.json"),
    `${JSON.stringify(
      {
        linter: {
          enabled: true,
          rules: {
            preset: "none",
            complexity: {
              noBannedTypes: "error",
              noUselessTypeConstraint: "error",
            },
            nursery: {
              noMisleadingReturnType: "error",
              noUnsafeTypeAssertion: "error",
              useReduceTypeParameter: "error",
            },
            style: {
              noNonNullAssertion: "error",
              useAsConstAssertion: "error",
            },
            suspicious: { noExplicitAny: "error" },
          },
        },
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    join(directory, "input.ts"),
    [
      "declare const maybeName: string | undefined;",
      "const unsafeName: any = maybeName;",
      "const assertedName = maybeName as string;",
      'const exactStatus = "ready" as "ready";',
      "const reducedNames = ['ready'].reduce((all, name) => [...all, name], [] as string[]);",
      'function getStatus(ready: boolean): string { return ready ? "ready" : "waiting"; }',
      "type Identity<Value extends unknown> = Value;",
      "type UnsafeCallback = Function;",
      "console.log(unsafeName, assertedName, exactStatus, reducedNames, maybeName!.length);",
      "export { getStatus };",
      "export type { Identity, UnsafeCallback };",
    ].join("\n"),
  );

  const result = spawnSync(biome, ["lint", "--reporter=json", "--colors=off", "input.ts"], {
    cwd: directory,
    encoding: "utf8",
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.notEqual(result.status, 0, output);
  assert.ok(output.includes("lint/complexity/noBannedTypes"), output);
  assert.ok(output.includes("lint/complexity/noUselessTypeConstraint"), output);
  assert.ok(output.includes("lint/nursery/noMisleadingReturnType"), output);
  assert.ok(output.includes("lint/nursery/noUnsafeTypeAssertion"), output);
  assert.ok(output.includes("lint/nursery/useReduceTypeParameter"), output);
  assert.ok(output.includes("lint/style/noNonNullAssertion"), output);
  assert.ok(output.includes("lint/style/useAsConstAssertion"), output);
  assert.ok(output.includes("lint/suspicious/noExplicitAny"), output);
});
