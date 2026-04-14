---
name: qa-agent
description: "Run a full QA review of this codebase. Traces cross-file impact, checks framework best practices, security, performance, and accessibility. Use /qa-agent for full review, /qa-agent [filepath] for targeted review, /qa-agent --diff for changed files only, /qa-agent --hotspots for most-changed files only."
allowed-tools: Read, Grep, Glob, Bash
memory: project
---

# QA Agent

Use this skill to run a production-style QA review against the Keploy blog codebase.

This repository is a Next.js Pages Router site backed by WordPress GraphQL. It has high SEO sensitivity, Vercel deployment, Playwright end-to-end coverage, and several high-churn route and metadata files. Review for correctness first, then security, SEO, accessibility, and performance.

## Always Load Context First

Before reviewing any file, read these in order:

1. `context/codebase-map.md`
2. `context/hotspots.md`
3. `context/known-suppressions.md`
4. `context/ignore.md`

Then load only the rules and checklists that apply to the current scope.

## Argument Parsing

Parse `$ARGUMENTS` exactly once before reviewing:

- Empty arguments:
  - Run `git diff HEAD --name-only`.
  - If that returns files, review those files.
  - If that is empty, fall back to the 10 most recently changed tracked files from git history:
    - `git log --name-only --pretty=format: -n 25 | awk 'NF && !seen[$0]++' | head -10`
- A single filepath:
  - Review that file.
  - Also review its dependents and impacted files discovered by the subagents.
- `--diff`:
  - Review only `git diff HEAD --name-only`.
  - If empty, print `No files in git diff HEAD; nothing to review.` and stop.
- `--full`:
  - Review the entire codebase.
  - Prioritize order using `context/hotspots.md`, then expand to the rest of the repo excluding ignored paths.
- `--hotspots`:
  - Review only the files listed in `context/hotspots.md`.

If a requested path matches any pattern in `context/ignore.md`, skip it and say why.

## Review Scope Resolution

After choosing the starting file list:

1. Remove ignored files and generated artifacts using `context/ignore.md`.
2. Deduplicate paths.
3. For empty scope after filtering, print `No reviewable files found after ignore filtering.` and stop.

## Parallel Subagents

Spawn these three subagents in parallel with the Task tool.

### Subagent A

- Definition: `agents/codebase-explorer.md`
- `subagent_type`: `Explore`
- Prompt:

```text
Read the file(s) being reviewed. Identify all import/export relationships. Which other files import from these files? Which files do these files import from? Return a structured dependency map.
```

### Subagent B

- Definition: `agents/impact-tracer.md`
- `subagent_type`: `general-purpose`
- Prompt:

```text
Given the files being reviewed: [list]. Use Grep and Glob to find every file in the project that imports from or references these files. Also check for dynamic imports, re-exports, and barrel files (index.ts). Return a list of impacted files with their relationship type.
```

### Subagent C

- Definition: `agents/qa-reviewer.md`
- `subagent_type`: `general-purpose`
- memory: `project`
- Prompt:

```text
Load rules from rules/ directory relevant to this project. Load relevant checklists. Review the target files + any impacted files identified by subagent B. Apply all rules. Return structured findings.
```

## Merge The Results

After all subagents complete:

1. Merge the dependency map from A and the impact data from B.
2. Expand the QA review findings from C with any breakage risks implied by A or B.
3. Do not re-flag anything already listed in `context/known-suppressions.md` unless the suppression itself is incorrect, stale, or too broad.
4. For impacted files not directly changed, use lower scrutiny:
   - Check for runtime breakage, broken imports, routing mismatch, SEO regressions, auth gaps, and metadata drift.
   - Do not spend time on stylistic nits in untouched dependents.

## Output Contract

Use `templates/report.md` to assemble the final report.

Severity values must be one of:

- `blocking`
- `warning`
- `suggestion`
- `nitpick`

Order findings by severity, then by file path.

For every finding include:

- severity
- file
- line
- rule
- what
- why
- fix

## Write The Report

Write the final report to:

`qa-reports/YYYY-MM-DD-HH-MM.md`

Create `qa-reports/` only if it does not exist at runtime.

## Terminal Summary

After writing the report, print a compact terminal summary:

- total files reviewed
- total impacted files
- total skipped files
- total findings by severity

Use this format:

```text
QA review complete
Blocking: N
Warning: N
Suggestion: N
Nitpick: N
Report: qa-reports/YYYY-MM-DD-HH-MM.md
```
