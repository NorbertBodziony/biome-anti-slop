import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "rules");
const destination = join(root, "skills/biome-anti-slop/assets/anti-slop/rules");
const check = process.argv.includes("--check");

function gritFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".grit"))
    .map((entry) => entry.name)
    .sort();
}

if (check) {
  const expected = gritFiles(source);
  const actual = gritFiles(destination);
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error("Skill assets differ from rules; run `bun run sync:skill-assets`.");
  }
  for (const name of expected) {
    if (
      readFileSync(join(source, name), "utf8") !== readFileSync(join(destination, name), "utf8")
    ) {
      throw new Error(`${name} differs from its skill asset; run \`bun run sync:skill-assets\`.`);
    }
  }
  console.log(`Verified ${expected.length} synchronized skill assets.`);
} else {
  rmSync(destination, { recursive: true, force: true });
  cpSync(source, destination, { recursive: true });
  console.log(`Synced ${relative(root, destination)}.`);
}
