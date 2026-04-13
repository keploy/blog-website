from __future__ import annotations

import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Sequence, Tuple

from anthropic import Anthropic
from github import Github
from github.GithubException import GithubException


MARKER_COMMENT = "<!-- design-agent-review-comment -->"

KNOWN_VERDICTS = (
    "APPROVE",
    "APPROVE_WITH_NITS",
    "CHANGES_REQUESTED",
    "MANUAL_REVIEW_REQUIRED",
)


DESIGN_PATH_PREFIXES = (
    "components/",
    "pages/",
    "styles/",
    "public/images/",
    "public/videos/",
    "design-agent/",
)

ROOT_CONFIG_FILES = (
    "tailwind.config.js",
    "tailwind.config.cjs",
    "tailwind.config.ts",
    "next.config.js",
    "next.config.mjs",
    "next.config.cjs",
)

ALLOWED_EXTENSIONS = (
    ".css",
    ".scss",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".md",
    ".mdx",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
)

EXCLUDED_DIFF_PATHS = {
    "design-agent/BLOG_DESIGN_GUIDELINES.md",
}

TRUSTED_ASSOCIATIONS = {"OWNER", "MEMBER", "COLLABORATOR"}


def _env_required(name: str) -> str:
    value = os.getenv(name)
    if value is None or not value.strip():
        raise RuntimeError(f"Missing required env var: {name}")
    return value.strip()


def _env_optional(name: str, default: str) -> str:
    value = os.getenv(name)
    if value is None:
        return default
    value = value.strip()
    return value if value else default


def _env_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in ("1", "true", "yes", "y", "on")


def _is_allowed_extension(path: str) -> bool:
    lower = path.lower()
    return any(lower.endswith(ext) for ext in ALLOWED_EXTENSIONS)


def _is_design_relevant_path(path: str) -> bool:
    if path in ROOT_CONFIG_FILES:
        return True
    return any(path.startswith(prefix) for prefix in DESIGN_PATH_PREFIXES)


@dataclass(frozen=True)
class DiffFilterResult:
    textual_patch_files: Tuple[str, ...]
    textual_patch_payload: str
    skipped_non_design: Tuple[str, ...]
    skipped_excluded: Tuple[str, ...]
    skipped_no_patch: Tuple[str, ...]


def _filter_design_diff(pr_files: Sequence[object]) -> DiffFilterResult:
    textual_patch_files: List[str] = []
    skipped_non_design: List[str] = []
    skipped_excluded: List[str] = []
    skipped_no_patch: List[str] = []

    chunks: List[str] = []

    for f in pr_files:
        filename = getattr(f, "filename", None)
        if not filename:
            continue

        if filename in EXCLUDED_DIFF_PATHS:
            skipped_excluded.append(filename)
            continue

        if not _is_design_relevant_path(filename) or not _is_allowed_extension(filename):
            skipped_non_design.append(filename)
            continue

        patch = getattr(f, "patch", None)
        if not patch or not str(patch).strip():
            skipped_no_patch.append(filename)
            continue

        textual_patch_files.append(filename)
        chunks.append(f"---\nFile: {filename}\n{patch}\n")

    payload = "\n".join(chunks).strip()
    return DiffFilterResult(
        textual_patch_files=tuple(textual_patch_files),
        textual_patch_payload=payload,
        skipped_non_design=tuple(skipped_non_design),
        skipped_excluded=tuple(skipped_excluded),
        skipped_no_patch=tuple(skipped_no_patch),
    )


def _fetch_common_guidelines() -> str:
    commons_token = _env_required("DESIGN_COMMONS_TOKEN")
    repo_full_name = _env_optional("COMMON_GUIDELINES_REPO", "keploy/landing-page")
    path = _env_optional(
        "COMMON_GUIDELINES_PATH", "design-agent/COMMON_DESIGN_GUIDELINES.md"
    )
    ref = _env_optional("COMMON_GUIDELINES_REF", "main")

    gh = Github(commons_token, per_page=100)
    repo = gh.get_repo(repo_full_name)
    content = repo.get_contents(path, ref=ref)
    if isinstance(content, list):
        raise RuntimeError(
            "COMMON_GUIDELINES_PATH resolved to a directory, expected a file."
        )
    data = content.decoded_content.decode("utf-8", errors="replace")
    if not data.strip():
        raise RuntimeError("Fetched common design guidelines are empty.")
    return data


def _load_blog_guidelines(repo_root: Path) -> str:
    blog_path = repo_root / "design-agent" / "BLOG_DESIGN_GUIDELINES.md"
    if not blog_path.exists():
        raise RuntimeError(f"Missing local blog guidelines at {blog_path.as_posix()}")
    data = blog_path.read_text(encoding="utf-8", errors="replace")
    if not data.strip():
        raise RuntimeError("Local blog design guidelines are empty.")
    return data


def _build_review_prompt(guidelines: str, diff_payload: str) -> Tuple[str, str]:
    system = (
        "You are a production-grade Design Review Agent for a Next.js + Tailwind blog.\n"
        "You must follow the provided design guidelines exactly.\n"
        "\n"
        "Output format (STRICT):\n"
        "## Design review summary\n"
        "## Verdict\n"
        "(single token only, exactly one of: "
        + ", ".join(KNOWN_VERDICTS)
        + ")\n"
        "## Violations\n"
        "## Improvement suggestions (non-blocking, max 3)\n"
        "## Flagged for discussion\n"
        "(always present; write 'None.' if none)\n"
        "## Approved changes\n"
        "\n"
        "Rules:\n"
        "- Keep the Verdict section to ONLY the verdict token on its own line.\n"
        "- Do not include markdown tables (lines containing '|') anywhere.\n"
        "- Only judge what is in the diff payload.\n"
        "- Cite files/paths when referencing issues.\n"
        "\n"
        "Design guidelines (COMMON then BLOG):\n"
        "-----\n"
        f"{guidelines}\n"
        "-----\n"
    )

    user = (
        "Review the following PR diff for design/UI quality against the guidelines.\n"
        "Only consider the included files and patches.\n"
        "\n"
        "Diff payload:\n"
        "-----\n"
        f"{diff_payload}\n"
        "-----\n"
    )
    return system, user


def _concat_anthropic_text(response: object) -> str:
    content = getattr(response, "content", None)
    if not content:
        return ""
    parts: List[str] = []
    for block in content:
        text = getattr(block, "text", None)
        if text:
            parts.append(str(text))
    return "\n".join(parts).strip()


def _extract_verdict(output_text: str) -> str:
    matches: List[str] = []
    token_re = re.compile(r"\b(" + "|".join(map(re.escape, KNOWN_VERDICTS)) + r")\b")

    for line in output_text.splitlines():
        if "|" in line:
            continue
        for m in token_re.findall(line):
            matches.append(m)

    unique = sorted(set(matches))
    if len(unique) != 1:
        raise RuntimeError(
            f"Verdict parse failed: expected exactly 1 token, found {unique or 'none'}"
        )
    verdict = unique[0]

    # Enforce: Verdict section contains ONLY the token.
    verdict_line = _first_verdict_section_line(output_text)
    if verdict_line != verdict:
        raise RuntimeError(
            "Verdict section invalid: expected a single token line matching the verdict."
        )

    return verdict


def _first_verdict_section_line(output_text: str) -> Optional[str]:
    lines = output_text.splitlines()
    start_idx: Optional[int] = None
    for i, line in enumerate(lines):
        if line.strip().lower() == "## verdict":
            start_idx = i + 1
            break
    if start_idx is None:
        return None

    for j in range(start_idx, len(lines)):
        candidate = lines[j].strip()
        if not candidate:
            continue
        if "|" in candidate:
            continue
        return candidate
    return None


def _validate_required_sections(output_text: str) -> None:
    required = (
        "## Design review summary",
        "## Verdict",
        "## Violations",
        "## Improvement suggestions",
        "## Flagged for discussion",
        "## Approved changes",
    )
    missing = [h for h in required if h.lower() not in output_text.lower()]
    if missing:
        raise RuntimeError(f"LLM output missing required sections: {missing}")


def _upsert_pr_comment(issue: object, body: str) -> None:
    comments = issue.get_comments()
    for c in comments:
        existing = getattr(c, "body", "") or ""
        if MARKER_COMMENT in existing:
            c.edit(body)
            return
    issue.create_comment(body)


def _manual_review_comment(
    *,
    summary: str,
    violations: Sequence[str],
    approved: Sequence[str],
    flagged: str = "None.",
) -> str:
    violations_block = "\n".join(f"- {v}" for v in violations) if violations else "None."
    approved_block = "\n".join(f"- {a}" for a in approved) if approved else "None."
    return "\n".join(
        [
            MARKER_COMMENT,
            "## Design review summary",
            summary,
            "## Verdict",
            "MANUAL_REVIEW_REQUIRED",
            "## Violations",
            violations_block,
            "## Improvement suggestions (non-blocking, max 3)",
            "None.",
            "## Flagged for discussion",
            flagged or "None.",
            "## Approved changes",
            approved_block,
        ]
    ).strip()


def main() -> int:
    repo_root = Path(__file__).resolve().parents[2]

    _enforce_trusted_issue_comment_trigger()

    github_token = _env_required("GITHUB_TOKEN")
    github_repository = _env_required("GITHUB_REPOSITORY")
    pr_number = int(_env_required("PR_NUMBER"))

    allow_external = _env_bool("ALLOW_EXTERNAL_PR_REVIEW", default=False)

    gh = Github(github_token, per_page=100)
    repo = gh.get_repo(github_repository)
    pr = repo.get_pull(pr_number)

    head_sha = pr.head.sha
    head_repo_full_name = pr.head.repo.full_name
    base_repo_full_name = pr.base.repo.full_name
    is_external_pr = head_repo_full_name.lower() != base_repo_full_name.lower()

    if is_external_pr and not allow_external:
        print(
            f"External PR detected ({head_repo_full_name}); skipping design review "
            "because ALLOW_EXTERNAL_PR_REVIEW is not enabled.",
            file=sys.stderr,
        )
        return 0

    pr_files = list(pr.get_files())
    filtered = _filter_design_diff(pr_files)

    if not filtered.textual_patch_files:
        if filtered.skipped_no_patch:
            issue = pr.as_issue()
            body = _manual_review_comment(
                summary=(
                    "Design-relevant files were changed but GitHub did not provide a textual patch "
                    "(binary or too-large diff). Manual design review is required."
                ),
                violations=[
                    "No textual patch available for one or more design-relevant files.",
                ],
                approved=[
                    f"Detected {len(filtered.skipped_no_patch)} design-relevant file(s) without patch.",
                ],
                flagged="Consider adding screenshots/video in the PR description for these changes.",
            )
            body = _with_footer_links(
                body=body,
                pr_number=pr_number,
                base_repo_full_name=base_repo_full_name,
                head_repo_full_name=head_repo_full_name,
                head_sha=head_sha,
                filtered=filtered,
            )
            _upsert_pr_comment(issue, body)
        else:
            print("No design-relevant textual diff found; not posting a PR comment.")
        return 0

    max_payload_chars = int(_env_optional("DESIGN_DIFF_MAX_CHARS", "120000"))
    if len(filtered.textual_patch_payload) > max_payload_chars:
        issue = pr.as_issue()
        body = _manual_review_comment(
            summary=(
                "Design-relevant diff is too large to review safely in the automated design agent. "
                "Manual review is required."
            ),
            violations=[
                "Diff payload exceeded the configured size limit for automated review.",
            ],
            approved=[
                f"Detected {len(filtered.textual_patch_files)} design-relevant file(s) with textual patches.",
            ],
            flagged="Consider splitting the PR or attaching screenshots/videos for quick review.",
        )
        body = _with_footer_links(
            body=body,
            pr_number=pr_number,
            base_repo_full_name=base_repo_full_name,
            head_repo_full_name=head_repo_full_name,
            head_sha=head_sha,
            filtered=filtered,
        )
        _upsert_pr_comment(issue, body)
        return 0

    common = _fetch_common_guidelines()
    blog = _load_blog_guidelines(repo_root)
    merged_guidelines = f"{common.strip()}\n\n{blog.strip()}"

    system, user = _build_review_prompt(
        guidelines=merged_guidelines, diff_payload=filtered.textual_patch_payload
    )

    anthropic_api_key = _env_required("ANTHROPIC_API_KEY")
    model = _env_optional("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest")

    client = Anthropic(api_key=anthropic_api_key)

    output_text = ""
    for attempt in (1, 2):
        response = client.messages.create(
            model=model,
            max_tokens=1600,
            temperature=0.2,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        output_text = _concat_anthropic_text(response)
        if output_text.strip():
            break
        if attempt == 1:
            print("Empty LLM response; retrying once...", file=sys.stderr)

    if not output_text.strip():
        raise RuntimeError("LLM returned an empty response after 2 attempts.")

    _validate_required_sections(output_text)
    verdict = _extract_verdict(output_text)
    print(f"Parsed verdict: {verdict}")

    issue = pr.as_issue()
    body = "\n".join([MARKER_COMMENT, output_text.strip()]).strip()
    body = _with_footer_links(
        body=body,
        pr_number=pr_number,
        base_repo_full_name=base_repo_full_name,
        head_repo_full_name=head_repo_full_name,
        head_sha=head_sha,
        filtered=filtered,
    )
    _upsert_pr_comment(issue, body)
    return 0


def _enforce_trusted_issue_comment_trigger() -> None:
    """
    Defense-in-depth: even if the workflow is misconfigured, only run `/design-review`
    when the comment author is trusted (OWNER/MEMBER/COLLABORATOR).
    """
    if os.getenv("GITHUB_EVENT_NAME") != "issue_comment":
        return

    event_path = os.getenv("GITHUB_EVENT_PATH")
    if not event_path:
        raise RuntimeError("Missing GITHUB_EVENT_PATH for issue_comment event.")

    payload = json.loads(Path(event_path).read_text(encoding="utf-8"))
    comment_body = (payload.get("comment") or {}).get("body") or ""
    author_association = (payload.get("comment") or {}).get("author_association") or ""

    if "/design-review" not in comment_body:
        print("issue_comment event without /design-review; skipping.", file=sys.stderr)
        raise SystemExit(0)

    if author_association not in TRUSTED_ASSOCIATIONS:
        print(
            f"Untrusted comment author_association={author_association}; skipping.",
            file=sys.stderr,
        )
        raise SystemExit(0)


def _with_footer_links(
    *,
    body: str,
    pr_number: int,
    base_repo_full_name: str,
    head_repo_full_name: str,
    head_sha: str,
    filtered: DiffFilterResult,
) -> str:
    commit_url = f"https://github.com/{head_repo_full_name}/commit/{head_sha}"
    tree_url = f"https://github.com/{head_repo_full_name}/tree/{head_sha}"
    pr_commits_url = (
        f"https://github.com/{base_repo_full_name}/pull/{pr_number}/commits/{head_sha}"
    )

    meta_lines = [
        "",
        "---",
        f"Reviewed commit: `{head_sha}`",
        f"- Commit: {commit_url}",
        f"- Tree: {tree_url}",
        f"- PR commits (pinned): {pr_commits_url}",
        "",
        "Design diff filter stats:",
        f"- `textual_patch_files`: {len(filtered.textual_patch_files)}",
        f"- `skipped_no_patch`: {len(filtered.skipped_no_patch)}",
        f"- `skipped_excluded`: {len(filtered.skipped_excluded)}",
        f"- `skipped_non_design`: {len(filtered.skipped_non_design)}",
    ]

    if filtered.textual_patch_files:
        meta_lines.append(
            "- Files reviewed:\n" + "\n".join(f"  - `{p}`" for p in filtered.textual_patch_files)
        )
    if filtered.skipped_no_patch:
        meta_lines.append(
            "- Design files without textual patch:\n"
            + "\n".join(f"  - `{p}`" for p in filtered.skipped_no_patch)
        )

    return (body.rstrip() + "\n" + "\n".join(meta_lines).rstrip() + "\n").strip()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except GithubException as e:
        print(f"GitHub API error: {e}", file=sys.stderr)
        raise
    except Exception as e:
        print(str(e), file=sys.stderr)
        raise
