# Releasing

Releases are created automatically from immutable semantic-version tags.

## Prepare a release

1. Make sure `main` is green and up to date.
2. Set the new semantic version in `package.json`, run `bun run sync:skill`, and refresh `bun.lock`
   with `bun install`.
3. Run `bun run check` and merge the version change into `main`.
4. Create and push an annotated tag that exactly matches the package version:

   ```bash
   git switch main
   git pull --ff-only
   git tag -a v0.4.0 -m "Release v0.4.0"
   git push origin v0.4.0
   ```

The Release workflow verifies that the tag matches `package.json`, confirms that the tagged commit
is reachable from `main`, reruns every check, builds a source archive and SHA-256 checksum, creates
a draft GitHub release with generated notes, uploads all assets, and publishes it.

Do not move, delete, or reuse a release tag. Published releases and their tags are immutable.
