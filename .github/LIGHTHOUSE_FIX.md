# Lighthouse Workflow Fix Documentation

## Problem
The Lighthouse GitHub Actions had two workflows:
1. **lighthouse_runner.yml** - Runs Lighthouse audits
2. **lighthouse_comment.yml** - Posts results as PR comments

The comment workflow was working, but there were issues with how it accessed the PR context.

## Root Cause
The `lighthouse_comment.yml` workflow is triggered by the `workflow_run` event (when "Lighthouse – Run" completes). However, it was trying to access `${{ github.event.pull_request.number }}`, which is **not available** in a `workflow_run` context.

In a `workflow_run` event:
- `github.event.pull_request` is NOT available
- PR information must be extracted from `github.event.workflow_run.pull_requests`

## Changes Made

### 1. Fixed Artifact Download
```yaml
- name: Download Lighthouse comment artifact
  uses: actions/download-artifact@v4
  with:
    name: lighthouse-comment
    github-token: ${{ secrets.GITHUB_TOKEN }}
    run-id: ${{ github.event.workflow_run.id }}  # Added: Download from triggering workflow
```

### 2. Added PR Number Extraction
```yaml
- name: Extract PR number
  id: pr
  run: |
    PR_NUMBER=$(jq -r '.workflow_run.pull_requests[0].number' <<< '${{ toJSON(github.event) }}')
    echo "number=$PR_NUMBER" >> $GITHUB_OUTPUT
```

### 3. Updated Comment Step
```yaml
- name: Post Lighthouse comment
  uses: peter-evans/create-or-update-comment@v4
  with:
    issue-number: ${{ steps.pr.outputs.number }}  # Changed: Use extracted PR number
    body-path: lighthouse-comment.md
    edit-mode: replace
```

### 4. Added Success Check
```yaml
jobs:
  comment:
    runs-on: ubuntu-latest
    if: github.event.workflow_run.conclusion == 'success'  # Only run if lighthouse succeeded
```

## How It Works Now

1. When a PR is opened/updated, `lighthouse_runner.yml` runs:
   - Builds and starts PR branch on port 3001
   - Builds and starts main branch on port 3000
   - Runs Lighthouse audits on both
   - Generates comparison report
   - Uploads report as artifact

2. When the runner completes, `lighthouse_comment.yml` triggers:
   - Downloads artifact from the completed workflow run (using `run-id`)
   - Extracts PR number from the workflow run event
   - Posts the Lighthouse comparison as a PR comment

## Additional Notes

### "action_required" Status
If you see "action_required" status on workflow runs from forked repositories, this is normal GitHub behavior. The workflow requires manual approval from a maintainer before it can run. This is a security feature to prevent malicious code execution from forks.

### Permissions
The workflows use minimal permissions:
- `lighthouse_runner.yml`: `contents: read`
- `lighthouse_comment.yml`: `issues: write`, `pull-requests: write`

This follows the principle of least privilege for security.
