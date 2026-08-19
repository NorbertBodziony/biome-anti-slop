import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rulesSource = join(root, "rules");
const rulesDestination = join(root, "skills/biome-anti-slop/assets/anti-slop/rules");
const installerSource = join(root, "src/install.ts");
const installerDestination = join(root, "skills/biome-anti-slop/scripts/install.js");
const check = process.argv.includes("--check");

function gritFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".grit"))
    .map((entry) => entry.name)
    .sort();
}

function compiledInstaller(): string {
  const outputDirectory = join(tmpdir(), `biome-anti-slop-tsc-${process.pid}`);
  rmSync(outputDirectory, { recursive: true, force: true });
  try {
    const result = spawnSync(
      join(root, "node_modules/.bin/tsc"),
      [
        "--ignoreConfig",
        installerSource,
        "--target",
        "ES2022",
        "--module",
        "ES2022",
        "--moduleResolution",
        "Bundler",
        "--types",
        "node",
        "--skipLibCheck",
        "--rootDir",
        join(root, "src"),
        "--outDir",
        outputDirectory,
      ],
      { cwd: root, encoding: "utf8" },
    );
    if (result.status !== 0) {
      throw new Error(`TypeScript installer compilation failed:\n${result.stdout}${result.stderr}`);
    }
    return readFileSync(join(outputDirectory, "install.js"), "utf8");
  } finally {
    rmSync(outputDirectory, { recursive: true, force: true });
  }
}

function verifyRules(): number {
  const expected = gritFiles(rulesSource);
  const actual = gritFiles(rulesDestination);
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error("Skill assets differ from rules; run `bun run sync:skill`.");
  }
  for (const name of expected) {
    if (
      readFileSync(join(rulesSource, name), "utf8") !==
      readFileSync(join(rulesDestination, name), "utf8")
    ) {
      throw new Error(`${name} differs from its skill asset; run \`bun run sync:skill\`.`);
    }
  }
  return expected.length;
}

if (check) {
  const ruleCount = verifyRules();
  if (!existsSync(installerDestination)) {
    throw new Error("Compiled skill installer is missing; run `bun run sync:skill`.");
  }
  if (readFileSync(installerDestination, "utf8") !== compiledInstaller()) {
    throw new Error("Compiled skill installer is stale; run `bun run sync:skill`.");
  }
  console.log(`Verified ${ruleCount} synchronized rules and the compiled TypeScript installer.`);
} else {
  rmSync(rulesDestination, { recursive: true, force: true });
  cpSync(rulesSource, rulesDestination, { recursive: true });
  writeFileSync(installerDestination, compiledInstaller());
  console.log(
    `Synced ${relative(root, rulesDestination)} and compiled ${relative(root, installerDestination)}.`,
  );
}
