# Design Review Agent (blog-website)

This repo includes a hardened Design Review Agent that reviews **design/UI-relevant diffs** on pull requests and posts a single upserted PR comment.

## Guideline architecture (private common + local blog)

At runtime, the agent merges guidelines in this order:

1. **COMMON (private, remote)**: fetched via GitHub API from `keploy/landing-page` at `design-agent/COMMON_DESIGN_GUIDELINES.md`
2. **BLOG (local, this repo)**: `design-agent/BLOG_DESIGN_GUIDELINES.md`

The common guideline file is **not copied into this repo**; it is fetched per run using `DESIGN_COMMONS_TOKEN`.

## Triggers

Workflow file: `.github/workflows/design-review.yml`

- `pull_request`: runs automatically on UI/design paths (components/pages/styles/public + configs + `design-agent/**`)
- `issue_comment`: runs only when a trusted actor comments `/design-review` on a PR
- `workflow_dispatch`: manual run with `pr_number`

## Required secrets

- `ANTHROPIC_API_KEY`: Anthropic API key used for the review call.
- `DESIGN_COMMONS_TOKEN`: GitHub token with read access to the private common guidelines repo (`keploy/landing-page`).

## Security behavior (forks / external PRs)

The workflow and script are hardened for forks/external PRs:

- Checkout strategy:
  - Internal PR: checks out `pr.head.sha`
  - External PR: checks out the base repo default branch (safe)
- Script enforcement:
  - External PRs are **skipped** unless `ALLOW_EXTERNAL_PR_REVIEW=true`
- `/design-review` comment trigger:
  - Only `OWNER`, `MEMBER`, or `COLLABORATOR` can trigger via comment (workflow + script defense-in-depth).

## Configuration (env vars)

Provided by the workflow (overridable via repo `vars`):

- `COMMON_GUIDELINES_REPO` (default `keploy/landing-page`)
- `COMMON_GUIDELINES_PATH` (default `design-agent/COMMON_DESIGN_GUIDELINES.md`)
- `COMMON_GUIDELINES_REF` (default `main`)

Optional:

- `ANTHROPIC_MODEL` (default `claude-3-5-sonnet-latest`)
- `DESIGN_DIFF_MAX_CHARS` (default `120000`)
- `ALLOW_EXTERNAL_PR_REVIEW` (default `false`)

## Troubleshooting

- Missing keys:
  - If `ANTHROPIC_API_KEY` or `DESIGN_COMMONS_TOKEN` is missing, the job fails when those are required.
- No textual patch:
  - If only design-relevant files without textual patches are detected (images/binary/too-large diffs), the agent posts a `MANUAL_REVIEW_REQUIRED` comment and **does not call** Anthropic.
- Empty LLM response:
  - The agent retries once (2 attempts). If still empty, it fails the job.
- Verdict parse failures:
  - The agent requires **exactly one** verdict token and requires the `## Verdict` section to contain only that token.
  - If verdict cannot be parsed, the job fails to prevent silent “looks OK” output.

