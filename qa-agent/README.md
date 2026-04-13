# QA Agent

Automated QA review system. Reviews PRs against guidelines derived from this repo’s own patterns, and flags second-order breakage using a codebase dependency map.

## Files

| File | Purpose |
|---|---|
| `QA_GUIDELINES.md` | The rules. Derived from codebase analysis. Edit via PR. |
| `codebase_map.json` | Reverse dependency graph. Auto-updated when `main`/`master` changes. |
| `scripts/qa_review.py` | Review agent — runs on PRs / manual trigger / comment trigger |
| `scripts/build_codebase_map.py` | Builds the dependency graph |
| `requirements.txt` | Python dependencies |

## How it works

1. A PR is opened/updated (or a reviewer comments `/qa-review`, or workflow is manually triggered)
2. Agent loads `QA_GUIDELINES.md`
3. Agent loads `codebase_map.json` (pre-built dependency graph)
4. Agent fetches the PR diff via GitHub API
5. Agent finds all files that depend on changed files (second-order analysis)
6. Agent sends everything to Claude with a structured review prompt
7. Review is posted as a PR comment

## Triggers

| Event | What happens |
|---|---|
| PR opened / commits pushed to PR | Full review runs automatically (`pull_request` + `synchronize`) |
| Comment `/qa-review` on PR | Re-runs full review |
| Comment `/qa-review fast` | Re-runs without second-order analysis |
| `workflow_dispatch` | Manual — enter PR number in Actions tab |
| Push to `main`/`master` | Codebase map is rebuilt and committed |

## Secrets required

- `ANTHROPIC_API_KEY` — add to repo/org secrets
- `GITHUB_TOKEN` — provided automatically by GitHub Actions

## Running locally

```bash
pip install -r qa-agent/requirements.txt
python qa-agent/scripts/build_codebase_map.py
```

