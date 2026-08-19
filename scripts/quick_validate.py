#!/usr/bin/env python3

import re
import sys
from pathlib import Path


def fail(message: str) -> None:
    print(f"Invalid skill: {message}", file=sys.stderr)
    raise SystemExit(1)


if len(sys.argv) != 2:
    fail("usage: quick_validate.py <skill-directory>")

skill_dir = Path(sys.argv[1]).resolve()
skill_file = skill_dir / "SKILL.md"
if not skill_file.is_file():
    fail("SKILL.md is missing")

text = skill_file.read_text(encoding="utf-8")
match = re.match(r"\A---\n(.*?)\n---\n", text, re.DOTALL)
if not match:
    fail("SKILL.md must start with YAML frontmatter")

frontmatter = match.group(1)
fields: dict[str, str] = {}
for line in frontmatter.splitlines():
    if not line.strip() or line.startswith((" ", "\t")):
        continue
    key, separator, value = line.partition(":")
    if separator:
        fields[key.strip()] = value.strip().strip('"\'')

name = fields.get("name", "")
description = fields.get("description", "")
if name != skill_dir.name:
    fail(f"frontmatter name {name!r} must match directory {skill_dir.name!r}")
if not re.fullmatch(r"[a-z0-9-]{1,63}", name):
    fail("name must contain only lowercase letters, digits, and hyphens")
if not description:
    fail("description is required")
if len(description) > 1024:
    fail("description is too long")
if re.search(r"\b(TODO|TBD|PLACEHOLDER)\b", text, re.IGNORECASE):
    fail("unfinished scaffold placeholder found")

print(f"Skill {name!r} is valid.")

