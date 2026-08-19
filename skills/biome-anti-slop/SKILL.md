---
name: biome-anti-slop
description: Install and configure vendored Biome anti-slop GritQL rules in a local TypeScript or JavaScript repository. Use when a user asks to add, configure, update, or migrate Biome anti-slop lint rules.
---

# Biome anti-slop

Vendor the bundled rules into the current repository and integrate them with its existing Biome
setup. Preserve unrelated work and adapt to the repository's package manager and configuration.

## Install

1. Inspect the repository before changing it:
   - Read applicable agent instructions and check `git status`.
   - Detect the package manager from `packageManager` and lockfiles.
   - Find `biome.json` or `biome.jsonc` files and existing anti-slop rules.
   - If multiple independent Biome roots exist, ask which one to configure.

2. Require Biome 2.x. Preserve an existing Biome 2.x dependency. If Biome is absent from a package
   manifest, install the current `@biomejs/biome` as a development dependency with the repository's
   package manager. If the repository uses Biome 1.x, stop and ask before upgrading it.

3. From the target repository, copy the bundled rules:

   ```bash
   node <skill-directory>/scripts/install.js
   ```

   The default destination is `tools/biome/anti-slop`. Pass another relative destination as the
   first argument when the repository has an established tooling layout. The installer refuses to
   replace an existing destination; use `--force` only after reviewing the existing files and the
   replacement diff.

4. Merge the installed files into the existing top-level `plugins` array. For the default
   destination, add all of these paths without removing existing plugins:

   ```json
   [
     "./tools/biome/anti-slop/rules/no-chained-type-assertions.grit",
     "./tools/biome/anti-slop/rules/no-conditional-empty-object-spread.grit",
     "./tools/biome/anti-slop/rules/no-known-value-widening.grit",
     "./tools/biome/anti-slop/rules/no-module-mocking.grit",
     "./tools/biome/anti-slop/rules/no-reflect-apply.grit",
     "./tools/biome/anti-slop/rules/no-reflect-get.grit",
     "./tools/biome/anti-slop/rules/no-runtime-typeof.grit",
     "./tools/biome/anti-slop/rules/no-shape-in-symbol-names.grit",
     "./tools/biome/anti-slop/rules/no-unknown-returns.grit",
     "./tools/biome/anti-slop/rules/no-unknown-type-aliases.grit",
     "./tools/biome/anti-slop/rules/no-unsafe-dictionary-type.grit"
   ]
   ```

   Preserve every existing configuration field. Add the vendored anti-slop directory to
   `files.includes` as a negated pattern so routine checks do not reformat vendored rules. Also add
   negated patterns for project-local agent tooling directories that actually exist, such as
   `.agents` or `.codex`; do not ignore all dot-directories. If no Biome configuration exists,
   create a minimal one with the local schema, the plugin list, and those file exclusions.

5. Run the repository's existing lint or check command. If none exists, run Biome directly. Report
   findings in owned source and fix them only when the user requested migration or cleanup. Do not
   suppress diagnostics, weaken their severity, or launder types to make the check pass.

6. Review the final diff and report the copied path, dependency change, configuration change,
   checks run, and any remaining findings.
