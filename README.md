# biome-anti-slop

Opinionated [Biome](https://biomejs.dev/) GritQL rules that reject low-evidence and low-signal
TypeScript patterns.

The rules are vendored into each repository. Teams can review them, change them, and keep their lint
policy next to their code.

## Install with an agent skill

```bash
npx skills add norbertbodziony/biome-anti-slop --skill biome-anti-slop
```

Then ask your coding agent:

> Install biome anti-slop in this repository.

The skill copies the rules into `tools/biome/anti-slop`, merges them into the existing Biome
configuration, enables the native anti-slop profile, preserves project-specific settings, and
validates the result.

To inspect the skill before installing it:

```bash
npx skills add norbertbodziony/biome-anti-slop --list
```

## Rules

- `no-chained-type-assertions` — rejects nested type assertions that discard type evidence.
- `no-conditional-empty-object-spread` — rejects conditional spreads that use `{}` to omit fields.
- `no-known-value-widening` — rejects explicit broad annotations on known values.
- `no-module-mocking` — rejects Vitest and Jest module mocking in favor of dependency seams.
- `no-object-parameters` — rejects the broad `object` type on function inputs.
- `no-reflect-apply` — rejects `Reflect.apply` in favor of typed calls.
- `no-reflect-get` — rejects `Reflect.get` in favor of typed property access.
- `no-runtime-typeof` — requires boundary parsing instead of ad hoc `typeof` narrowing.
- `no-shape-in-symbol-names` — rejects `shape` in symbol names.
- `no-unknown-returns` — rejects functions that expose `unknown` to callers.
- `no-unknown-type-aliases` — rejects aliases that conceal `unknown`.
- `no-unsafe-dictionary-type` — rejects broad dictionary value contracts.

### Native Biome rules

The skill also enables these built-in rules as errors, so their native implementations do not need
to be duplicated as GritQL plugins:

- `complexity/noBannedTypes`
- `complexity/noUselessTypeConstraint`
- `nursery/noMisleadingReturnType`
- `nursery/noUnsafeTypeAssertion`
- `nursery/useReduceTypeParameter`
- `style/noNonNullAssertion`
- `style/useAsConstAssertion`
- `suspicious/noExplicitAny`

The nursery rules are intentionally strict. They reject non-const type assertions, misleadingly
wide return types, and asserted `reduce` accumulators. Enabling the type-aware return rule activates
Biome's scanner and type inference.

## Manual installation

Copy `rules/` into your repository, for example at `tools/biome/anti-slop/rules/`, then add every
`.grit` file to the top-level `plugins` array and enable the native anti-slop rules in `biome.json`
or `biome.jsonc`:

```json
{
  "plugins": [
    "./tools/biome/anti-slop/rules/no-chained-type-assertions.grit",
    "./tools/biome/anti-slop/rules/no-conditional-empty-object-spread.grit",
    "./tools/biome/anti-slop/rules/no-known-value-widening.grit",
    "./tools/biome/anti-slop/rules/no-module-mocking.grit",
    "./tools/biome/anti-slop/rules/no-object-parameters.grit",
    "./tools/biome/anti-slop/rules/no-reflect-apply.grit",
    "./tools/biome/anti-slop/rules/no-reflect-get.grit",
    "./tools/biome/anti-slop/rules/no-runtime-typeof.grit",
    "./tools/biome/anti-slop/rules/no-shape-in-symbol-names.grit",
    "./tools/biome/anti-slop/rules/no-unknown-returns.grit",
    "./tools/biome/anti-slop/rules/no-unknown-type-aliases.grit",
    "./tools/biome/anti-slop/rules/no-unsafe-dictionary-type.grit"
  ],
  "linter": {
    "rules": {
      "complexity": {
        "noBannedTypes": "error",
        "noUselessTypeConstraint": "error"
      },
      "nursery": {
        "noMisleadingReturnType": "error",
        "noUnsafeTypeAssertion": "error",
        "useReduceTypeParameter": "error"
      },
      "style": {
        "noNonNullAssertion": "error",
        "useAsConstAssertion": "error"
      },
      "suspicious": {
        "noExplicitAny": "error"
      }
    }
  }
}
```

Biome `>=2.5.9 <3` is required. Exclude the vendored directory from routine formatting so local
checks do not rewrite copied policy files.

## Development

```bash
bun install --frozen-lockfile
bun run check
bun run sync:skill
npx skills add . --list
```

The development tooling and tests use TypeScript. `src/install.ts` is the canonical installer;
`bun run sync:skill` compiles its zero-dependency JavaScript runtime for skill users. `rules/` is
canonical, and CI verifies that the bundled installer and rule copies stay byte-for-byte current.

## Releases

Versioned releases are built from `vMAJOR.MINOR.PATCH` tags. Each release includes a source archive
and SHA-256 checksum after the full CI suite passes. See [docs/RELEASING.md](docs/RELEASING.md) for
the maintainer workflow.

## License

MIT. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for third-party notices.
