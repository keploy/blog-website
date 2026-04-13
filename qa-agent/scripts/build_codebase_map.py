"""
Codebase Map Builder
Scans the repository and builds a reverse dependency map:
  { "lib/api.ts": ["pages/index.tsx", "pages/community/index.tsx", ...] }

This tells the QA agent: "if lib/api.ts changes, these files might be affected."

Run this:
  - Once during initial setup
  - In CI on merges to main (to keep the map current)
  - Output: qa-agent/codebase_map.json
"""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(".").resolve()
OUTPUT = ROOT / "qa-agent" / "codebase_map.json"

SKIP_DIRS = {
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    "coverage",
    ".turbo",
    "test-results",
    "playwright-report",
}

SOURCE_EXTENSIONS = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
}

# TypeScript/JavaScript import patterns (this repo is TS/Next.js)
IMPORT_PATTERNS: list[re.Pattern[str]] = [
    # import ... from '...'
    re.compile(r"""from\s+['"]([^'"]+)['"]"""),
    # export ... from '...'
    re.compile(r"""export\s+.*from\s+['"]([^'"]+)['"]"""),
    # require('...')
    re.compile(r"""require\s*\(\s*['"]([^'"]+)['"]\s*\)"""),
    # dynamic import('...') / import('...')
    re.compile(r"""import\s*\(\s*['"]([^'"]+)['"]\s*\)"""),
]


def is_skipped_path(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)


def get_all_source_files() -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if is_skipped_path(path):
            continue
        if path.suffix in SOURCE_EXTENSIONS:
            files.append(path)
    return files


def normalize_repo_relative(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def resolve_import(importer: Path, import_path: str, all_files: set[str]) -> str | None:
    """
    Resolve an import string to a repo-relative file path, if it points to a local file.

    This repo uses tsconfig paths:
      "@/*": ["./*"]
    So "@/lib/api" resolves to "lib/api.ts" (no "src/" folder).
    """
    # External packages: ignore
    if not (import_path.startswith(".") or import_path.startswith("@/") or import_path.startswith("~/")):
        return None

    # Path aliases
    if import_path.startswith("@/"):
        import_path = import_path[2:]  # repo-root relative
        base = (ROOT / import_path).resolve()
    elif import_path.startswith("~/"):
        import_path = import_path[2:]
        base = (ROOT / import_path).resolve()
    else:
        base = (importer.parent / import_path).resolve()

    try:
        base_rel = base.relative_to(ROOT)
    except Exception:
        return None

    base_rel_str = base_rel.as_posix()

    # If import already includes extension
    if base_rel_str in all_files:
        return base_rel_str

    # Try with extensions
    for ext in SOURCE_EXTENSIONS:
        candidate = f"{base_rel_str}{ext}"
        if candidate in all_files:
            return candidate

    # Try directory index
    for ext in SOURCE_EXTENSIONS:
        candidate = f"{base_rel_str}/index{ext}"
        if candidate in all_files:
            return candidate

    return None


def build_map() -> dict[str, list[str]]:
    print("Scanning source files...")
    all_files = get_all_source_files()
    all_file_paths = {normalize_repo_relative(f) for f in all_files}
    print(f"Found {len(all_files)} source files.")

    reverse_deps: dict[str, set[str]] = defaultdict(set)

    for source_file in all_files:
        repo_rel_importer = normalize_repo_relative(source_file)
        try:
            content = source_file.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        for pattern in IMPORT_PATTERNS:
            for match in pattern.findall(content):
                resolved = resolve_import(source_file, match, all_file_paths)
                if resolved and resolved != repo_rel_importer:
                    reverse_deps[resolved].add(repo_rel_importer)

    return {k: sorted(v) for k, v in reverse_deps.items()}


def main() -> None:
    codebase_map = build_map()

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(codebase_map, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    print("\nCodebase map built:")
    print(f"  {len(codebase_map)} files have dependents")
    print("  Top 10 most depended-upon files:")
    top = sorted(codebase_map.items(), key=lambda x: len(x[1]), reverse=True)[:10]
    for path, dependents in top:
        print(f"    {path}: {len(dependents)} dependents")
    print(f"\nWritten to {normalize_repo_relative(OUTPUT)}")


if __name__ == "__main__":
    main()

