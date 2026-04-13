import importlib.util
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path


def _load_design_review_module():
    repo_root = Path(__file__).resolve().parents[2]
    script_path = repo_root / "design-agent" / "scripts" / "design_review.py"
    spec = importlib.util.spec_from_file_location("design_review", script_path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Failed to load design_review module spec.")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class _FakePRFile:
    def __init__(self, filename: str, patch=None):
        self.filename = filename
        self.patch = patch


class TestDiffFiltering(unittest.TestCase):
    def setUp(self):
        self.mod = _load_design_review_module()

    def test_filters_textual_patches_and_tracks_skips(self):
        files = [
            _FakePRFile("design-agent/BLOG_DESIGN_GUIDELINES.md", patch="x"),
            _FakePRFile("components/ui/button.tsx", patch="@@\n+change\n"),
            _FakePRFile("components/ui/logo.svg", patch=None),  # no patch -> skipped_no_patch
            _FakePRFile("lib/server.ts", patch="@@\n+no\n"),  # non-design path
            _FakePRFile("pages/_document.tsx", patch="@@\n+ok\n"),
            _FakePRFile("styles/index.css", patch="   "),  # empty patch -> skipped_no_patch
            _FakePRFile("next.config.js", patch="@@\n+ok\n"),
            _FakePRFile("README.md", patch="@@\n+no\n"),
        ]

        res = self.mod._filter_design_diff(files)

        self.assertIn("components/ui/button.tsx", res.textual_patch_files)
        self.assertIn("pages/_document.tsx", res.textual_patch_files)
        self.assertIn("next.config.js", res.textual_patch_files)
        self.assertNotIn("design-agent/BLOG_DESIGN_GUIDELINES.md", res.textual_patch_files)

        self.assertIn("design-agent/BLOG_DESIGN_GUIDELINES.md", res.skipped_excluded)
        self.assertIn("lib/server.ts", res.skipped_non_design)
        self.assertIn("README.md", res.skipped_non_design)

        self.assertIn("components/ui/logo.svg", res.skipped_no_patch)
        self.assertIn("styles/index.css", res.skipped_no_patch)

        self.assertIn("File: components/ui/button.tsx", res.textual_patch_payload)
        self.assertIn("File: pages/_document.tsx", res.textual_patch_payload)


class TestVerdictParsing(unittest.TestCase):
    def setUp(self):
        self.mod = _load_design_review_module()

    def test_valid_sections_and_verdict(self):
        output = "\n".join(
            [
                "## Design review summary",
                "Looks good.",
                "## Verdict",
                "APPROVE_WITH_NITS",
                "## Violations",
                "None.",
                "## Improvement suggestions (non-blocking, max 3)",
                "- Consider ...",
                "## Flagged for discussion",
                "None.",
                "## Approved changes",
                "- Good stuff.",
            ]
        )
        self.mod._validate_required_sections(output)
        verdict = self.mod._extract_verdict(output)
        self.assertEqual(verdict, "APPROVE_WITH_NITS")

    def test_rejects_missing_verdict_section_line(self):
        output = "\n".join(
            [
                "## Design review summary",
                "OK",
                "## Verdict",
                "",
                "APPROVE",
                "## Violations",
                "None.",
                "## Improvement suggestions (non-blocking, max 3)",
                "None.",
                "## Flagged for discussion",
                "None.",
                "## Approved changes",
                "None.",
            ]
        )
        # Blank line is allowed as long as first non-empty line is the token.
        verdict = self.mod._extract_verdict(output)
        self.assertEqual(verdict, "APPROVE")

    def test_rejects_verdict_section_with_extra_text(self):
        output = "\n".join(
            [
                "## Design review summary",
                "OK",
                "## Verdict",
                "APPROVE (looks good)",
                "## Violations",
                "None.",
                "## Improvement suggestions (non-blocking, max 3)",
                "None.",
                "## Flagged for discussion",
                "None.",
                "## Approved changes",
                "None.",
            ]
        )
        with self.assertRaises(RuntimeError):
            self.mod._extract_verdict(output)

    def test_rejects_multiple_verdict_tokens(self):
        output = "\n".join(
            [
                "## Design review summary",
                "OK",
                "## Verdict",
                "APPROVE",
                "## Violations",
                "None.",
                "## Improvement suggestions (non-blocking, max 3)",
                "None.",
                "## Flagged for discussion",
                "CHANGES_REQUESTED (maybe)  ",
                "## Approved changes",
                "None.",
            ]
        )
        with self.assertRaises(RuntimeError):
            self.mod._extract_verdict(output)


class TestTrustedCommentEnforcement(unittest.TestCase):
    def setUp(self):
        self.mod = _load_design_review_module()
        self._old_env = os.environ.copy()

    def tearDown(self):
        os.environ.clear()
        os.environ.update(self._old_env)

    def _write_event(self, payload: dict) -> str:
        fd, path = tempfile.mkstemp(prefix="gh-event-", suffix=".json")
        os.close(fd)
        Path(path).write_text(json.dumps(payload), encoding="utf-8")
        return path

    def test_skips_issue_comment_without_command(self):
        path = self._write_event(
            {
                "comment": {"body": "hello", "author_association": "OWNER"},
            }
        )
        os.environ["GITHUB_EVENT_NAME"] = "issue_comment"
        os.environ["GITHUB_EVENT_PATH"] = path
        with self.assertRaises(SystemExit) as cm:
            self.mod._enforce_trusted_issue_comment_trigger()
        self.assertEqual(cm.exception.code, 0)

    def test_skips_untrusted_author(self):
        path = self._write_event(
            {
                "comment": {"body": "/design-review", "author_association": "NONE"},
            }
        )
        os.environ["GITHUB_EVENT_NAME"] = "issue_comment"
        os.environ["GITHUB_EVENT_PATH"] = path
        with self.assertRaises(SystemExit) as cm:
            self.mod._enforce_trusted_issue_comment_trigger()
        self.assertEqual(cm.exception.code, 0)

    def test_allows_trusted_author(self):
        path = self._write_event(
            {
                "comment": {"body": "please /design-review", "author_association": "MEMBER"},
            }
        )
        os.environ["GITHUB_EVENT_NAME"] = "issue_comment"
        os.environ["GITHUB_EVENT_PATH"] = path
        # Should not raise
        self.mod._enforce_trusted_issue_comment_trigger()
