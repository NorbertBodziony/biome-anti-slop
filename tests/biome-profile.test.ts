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
            recommended: false,
            complexity: { noBannedTypes: "error" },
            style: { noNonNullAssertion: "error" },
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
      "type UnsafeCallback = Function;",
      "console.log(unsafeName, maybeName!.length);",
      "export type { UnsafeCallback };",
    ].join("\n"),
  );

  const result = spawnSync(biome, ["lint", "--reporter=json", "--colors=off", "input.ts"], {
    cwd: directory,
    encoding: "utf8",
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.notEqual(result.status, 0, output);
  assert.ok(output.includes("lint/complexity/noBannedTypes"), output);
  assert.ok(output.includes("lint/style/noNonNullAssertion"), output);
  assert.ok(output.includes("lint/suspicious/noExplicitAny"), output);
});
