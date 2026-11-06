import { S3_ASSET_BASE } from "../lib/constants";
export interface TooltipMedia {
  type: "image" | "gif" | "video";
  src: string;
  alt?: string;
}

export interface KeywordTooltipConfig {
  key: string;
  blogSlug: string;
  keyword: string;
  media: TooltipMedia;
  heading: string;
  ctaText: string;
  ctaHref: string;
}

const COVERAGE_VIDEO = "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/coverage.mp4";
const LOAD_VIDEO = "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/load+testing.mp4";

export const keywordTooltips: KeywordTooltipConfig[] = [

  // ─── white-box-testing (existing) ─────────────────────────────────────────
  {
    key: "white-box-captured-traffic",
    blogSlug: "white-box-testing",
    keyword: "captured production traffic",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/captured-production-traffic-tooltip.webp`,
      alt: "Live user traffic captured for automated test generation",
    },
    heading: "Real traffic. Real tests. Zero manual effort.",
    ctaText: "Try Keploy Free →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "white-box-quality-signals",
    blogSlug: "white-box-testing",
    keyword: "measurable quality signals",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/measurable-quality-signals-tooltip.webp`,
      alt: "Quality signals dashboard showing coverage reliability and release confidence",
    },
    heading: "Coverage that reflects real production behavior.",
    ctaText: "See it in action →",
    ctaHref: "https://app.keploy.io/signin",
  },

  // ─── software-testing-basics ──────────────────────────────────────────────
  // First ~50%: unit testing, integration testing, acceptance testing
  // Mid–late:   automated testing, API testing
  // Conclusion: shift-left
  {
    key: "basics-unit-testing",
    blogSlug: "software-testing-basics",
    keyword: "unit testing",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/unit-testing-tooltip.webp`,
      alt: "Unit testing coverage report showing generated tests and passed assertions",
    },
    heading: "Auto-generate unit tests from real traffic — zero scripting.",
    ctaText: "Try Keploy Free →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "basics-integration-testing",
    blogSlug: "software-testing-basics",
    keyword: "integration testing",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/integration-testing-tooltip.webp`,
      alt: "Schema coverage report showing improved integration test coverage",
    },
    heading: "Record real service calls and replay them as integration tests.",
    ctaText: "Try Keploy Free →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "basics-acceptance-testing",
    blogSlug: "software-testing-basics",
    keyword: "acceptance testing",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/acceptance-testing-tooltip.webp`,
      alt: "Acceptance testing dashboard showing passed specs and release gate status",
    },
    heading: "Validate end-user flows with auto-generated tests.",
    ctaText: "See How →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "basics-automated-testing",
    blogSlug: "software-testing-basics",
    keyword: "automated testing",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/test-automation-tooltip.webp`,
      alt: "Test automation dashboard showing generated tests in seconds",
    },
    heading: "Generate your entire test suite from real traffic.",
    ctaText: "Start Automating →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "basics-api-testing",
    blogSlug: "software-testing-basics",
    keyword: "API testing",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/api-testing-tooltip.webp`,
      alt: "API testing dashboard showing generated tests and request validation",
    },
    heading: "Auto-generate API tests — no scripting required.",
    ctaText: "Test Your APIs →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "basics-shift-left",
    blogSlug: "software-testing-basics",
    keyword: "shift-left",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/shift-left-testing-tooltip.webp`,
      alt: "Shift-left testing pipeline catching risks before release",
    },
    heading: "Shift left without writing a single test manually.",
    ctaText: "Try Keploy Free →",
    ctaHref: "https://app.keploy.io/signin",
  },

  // ─── software-testing-strategies ──────────────────────────────────────────
  // First ~50%: CI/CD pipelines, microservices, test automation, regression testing
  // Mid–late:   API testing
  // Conclusion: shift-left testing
  {
    key: "strategies-ci-cd",
    blogSlug: "software-testing-strategies",
    keyword: "CI/CD pipelines",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/test-automation-tooltip.webp`,
      alt: "Test automation dashboard showing CI/CD test generation in seconds",
    },
    heading: "Plug auto-generated tests straight into your CI pipeline.",
    ctaText: "Get Started →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "strategies-microservices",
    blogSlug: "software-testing-strategies",
    keyword: "microservices",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/microservices-tooltip.webp`,
      alt: "Microservices architecture with replayed service traces and mocked dependencies",
    },
    heading: "Test microservices end-to-end from real traffic recordings.",
    ctaText: "Try Keploy Free →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "strategies-test-automation",
    blogSlug: "software-testing-strategies",
    keyword: "test automation",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/test-automation-tooltip.webp`,
      alt: "Test automation dashboard showing generated tests in seconds",
    },
    heading: "Generate your automation suite from real production traffic.",
    ctaText: "Start Automating →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "strategies-regression-testing",
    blogSlug: "software-testing-strategies",
    keyword: "regression testing",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/regression-testing-tooltip.webp`,
      alt: "Regression testing comparison catching changed behavior before release",
    },
    heading: "Replay production traffic to catch every regression before release.",
    ctaText: "See It in Action →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "strategies-api-testing",
    blogSlug: "software-testing-strategies",
    keyword: "API testing",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/api-testing-tooltip.webp`,
      alt: "API testing dashboard showing generated tests and request validation",
    },
    heading: "Auto-generate battle-tested API tests from real traffic.",
    ctaText: "Try Keploy Free →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "strategies-shift-left",
    blogSlug: "software-testing-strategies",
    keyword: "shift-left testing",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/shift-left-testing-tooltip.webp`,
      alt: "Shift-left testing pipeline catching risks before release",
    },
    heading: "Shift left without writing a single test manually.",
    ctaText: "Try Keploy Free →",
    ctaHref: "https://app.keploy.io/signin",
  },

  // ─── api-testing-strategies ───────────────────────────────────────────────
  // First ~50%: functional testing, integration testing, contract testing, performance testing
  // Mid–late:   shift-left testing
  // Conclusion: flaky tests
  {
    key: "api-strats-functional",
    blogSlug: "api-testing-strategies",
    keyword: "functional testing",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/functional-testing-tooltip.webp`,
      alt: "Functional testing flow validating expected and actual feature behavior",
    },
    heading: "Validate API behavior automatically with traffic-based tests.",
    ctaText: "Try Keploy Free →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "api-strats-integration",
    blogSlug: "api-testing-strategies",
    keyword: "integration testing",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/integration-testing-tooltip.webp`,
      alt: "Schema coverage report showing improved integration test coverage",
    },
    heading: "Record real service calls and replay them as integration tests.",
    ctaText: "Try Keploy Free →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "api-strats-contract",
    blogSlug: "api-testing-strategies",
    keyword: "contract testing",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/contract-testing-tooltip.webp`,
      alt: "Contract testing validation between consumer and provider API schemas",
    },
    heading: "Auto-capture service contracts from real API interactions.",
    ctaText: "See How →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "api-strats-performance",
    blogSlug: "api-testing-strategies",
    keyword: "performance testing",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/performance-testing-tooltip.webp`,
      alt: "Performance testing visualization showing stable latency and throughput",
    },
    heading: "Stress-test your APIs with generated load test suites.",
    ctaText: "Get Started →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "api-strats-shift-left",
    blogSlug: "api-testing-strategies",
    keyword: "shift-left testing",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/shift-left-testing-tooltip.webp`,
      alt: "Shift-left testing pipeline catching risks before release",
    },
    heading: "Shift left without manual test authoring — Keploy records it all.",
    ctaText: "Try Keploy Free →",
    ctaHref: "https://app.keploy.io/signin",
  },
  {
    key: "api-strats-flaky",
    blogSlug: "api-testing-strategies",
    keyword: "flaky tests",
    media: {
      type: "image",
      src: `${S3_ASSET_BASE}/images/flaky-tests-tooltip.webp`,
      alt: "Flaky tests eliminated with stable deterministic test replays",
    },
    heading: "Replace flaky tests with deterministic traffic replays.",
    ctaText: "Fix Flakiness →",
    ctaHref: "https://app.keploy.io/signin",
  },

];

export function getTooltipsForSlug(slug: string): KeywordTooltipConfig[] {
  return keywordTooltips.filter((t) => t.blogSlug === slug);
}
