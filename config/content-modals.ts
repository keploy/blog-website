export interface ContentModalCta {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

export interface ContentModalImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ContentModalConfig {
  /** Unique, kebab-case. Used as the DOM id and the trigger's data attribute. */
  id: string;
  blogSlug: string;
  /**
   * Plain-text phrase from the post body that becomes the clickable trigger.
   * First match only, case-insensitive. Skipped inside links, headings, code and buttons.
   * If the phrase is not found, the modal is not rendered at all.
   */
  anchorText: string;
  title: string;
  /** Small pill next to the title, e.g. "Deep dive". */
  tag?: string;
  /** Paragraphs of plain text. */
  body: string[];
  bullets?: string[];
  image?: ContentModalImage;
  ctas?: ContentModalCta[];
}

const TRY_KEPLOY: ContentModalCta = {
  label: "Try Keploy Free",
  href: "https://app.keploy.io/signin",
  variant: "primary",
};

export const contentModals: ContentModalConfig[] = [
  // ─── state-transition-testing ──────────────────────────────────────────────
  {
    // https://keploy.io/blog/community/state-transition-testing
    id: "state-transition-testing-regression",
    blogSlug: "state-transition-testing",
    anchorText: "prevents regressions",
    title: "How State Transition Testing Strengthens Regression Testing",
    tag: "Deep dive",
    body: [
      "Most regressions in stateful features don't break a single action. They break a rule about what's allowed from a given state, like a canceled order that can still be refunded or a locked account that still gets a session.",
      "That's why state transition testing works well as the base of a regression test suite. A state transition table turns workflow rules into a reusable checklist, and every valid transition, invalid transition, and key sequence becomes a regression test case you can rerun after each release.",
      "Invalid transitions matter most here. A code change that quietly allows \"cancel after success\" won't fail a happy-path test, but it will fail a negative test that checks the state didn't change and no side effect happened.",
      "When a workflow changes, update the state model first. New states and events show which regression tests need updating and which new transitions need coverage, so the suite grows with the product instead of drifting from it.",
      "For API-heavy workflows, Keploy records real API calls along with their dependencies and replays them as tests, so retries, timeouts, and cancellations can be rechecked in CI on every build without writing each sequence by hand.",
    ],
    bullets: [
      "Rerun transition coverage tests whenever workflow logic, status fields, or API contracts change",
      "Assert no side effects on invalid transitions: no DB write, no new session, no emitted event",
      "Add 1-switch and n-switch sequence tests for paths that broke before, like retry after timeout",
      "Automate state-based regression tests in your CI/CD pipeline so broken transitions block the release",
      "Prioritize high-risk flows first: auth, payments, orders, and subscriptions",
    ],
    ctas: [
      TRY_KEPLOY,
      {
        label: "Regression Testing Guide",
        href: "https://keploy.io/blog/community/regression-testing-an-introductory-guide",
        variant: "secondary",
      },
    ],
  },
  {
    // https://keploy.io/blog/community/state-transition-testing
    // Replaces the H2 "State Transition Diagram Tools (Text to Diagram)", to be deleted in WordPress once live.
    id: "state-transition-testing-diagram-tools",
    blogSlug: "state-transition-testing",
    anchorText: "quick alignment across teams",
    title: "State Transition Diagram Tools (Text to Diagram)",
    tag: "Tools",
    body: [
      "Diagrams get outdated fast when they live only in slide decks. Many teams prefer \"diagram-as-text\" because it stays close to documentation, is easy to review in PRs, and updates naturally as workflows evolve.",
      "These tools take text input and generate a state transition diagram without manual dragging and aligning.",
      "A text-based diagram also works as a test planning file. Each arrow in the diagram maps to a row in the state transition table, so reviewers can check transition coverage straight from the source.",
      "These tools use the same state machine concepts covered in this post: states, events, transitions, and start and end states. That makes a model written once easy to read across QA, product, and development.",
      "A diagram defines which transitions should happen. Testing them is the next step. For API-driven workflows, Keploy records real request and response flows and replays them as tests, so the transitions in your diagram can be checked against how the system actually behaves.",
    ],
    bullets: [
      "Mermaid: A great option for Markdown-first documentation. Its state diagram syntax renders directly in GitHub and many docs tools, so explanations and visuals stay in one place.",
      "PlantUML: Fits well with diagram-as-code workflows and supports UML state machine diagrams. The source text can live in version control, and diagrams can be regenerated consistently across environments.",
      "Graphviz (DOT): Useful when teams want more control over layout and rendering. It works well for generating clean SVG/PNG outputs for documentation.",
      "State-machine-cat: A lightweight option for generating readable state charts from a simple text definition. It's handy when teams prefer a CLI-first workflow.",
    ],
    ctas: [TRY_KEPLOY],
  },

  // ─── complete-guide-to-ci-testing ──────────────────────────────────────────
  {
    // https://keploy.io/blog/community/complete-guide-to-ci-testing
    // Replaces the H2 "CI Testing for API-First & Microservices Projects", to be deleted in WordPress once live.
    id: "complete-guide-to-ci-testing-microservices",
    blogSlug: "complete-guide-to-ci-testing",
    anchorText: "microservices architecture",
    title: "CI Testing for API-First and Microservices Projects",
    tag: "Deep dive",
    body: [
      "Microservices and API-first architectures change what CI testing has to cover. A single commit can affect several services and the API contracts between them, so the pipeline needs to catch breaking changes before they reach a shared environment.",
      "The safest pattern is to test each service in isolation first, then validate how it talks to other services. Mocks and service virtualization stand in for dependencies like databases, third-party APIs, and downstream services, so CI runs stay repeatable even when those systems are slow or unavailable.",
      "Contract testing adds the next layer. Each API's request and response format is checked against what its consumers expect, so a renamed field or changed status code fails the build instead of breaking another team's service in production.",
      "Keploy fits this setup by recording real API calls along with their dependency responses, then replaying them as tests with auto-generated mocks. That gives each microservice an isolated, repeatable test suite that runs in the CI pipeline on every commit.",
    ],
    bullets: [
      "Test isolation: test each microservice independently before running integration tests across services",
      "Mock services: mock external services and dependencies so CI results don't depend on their availability",
      "Contract validation: run API contract tests to catch breaking changes between services early",
      "Parallel testing: run service test suites in parallel to keep feedback fast as the number of services grows",
      "Observability: use logs and metrics from API tests to pinpoint which microservice failed",
      "Ephemeral environments: spin up a fresh, isolated test environment per pull request for integration checks",
    ],
    ctas: [
      TRY_KEPLOY,
      { label: "Keploy CI/CD Docs", href: "https://keploy.io/docs/ci-cd/github/", variant: "secondary" },
    ],
  },
  {
    // https://keploy.io/blog/community/complete-guide-to-ci-testing
    // Replaces the H2 "Common Challenges in CI Testing", to be deleted in WordPress once live.
    id: "complete-guide-to-ci-testing-challenges",
    blogSlug: "complete-guide-to-ci-testing",
    anchorText: "erode developer confidence",
    title: "Common CI Testing Challenges and How to Fix Them",
    tag: "Troubleshooting",
    body: [
      "Even well-run CI pipelines hit the same problems as projects grow. Knowing them in advance makes it easier to build an efficient, scalable continuous integration pipeline.",
      "Most issues trace back to three things: unstable tests, slow feedback, and test environments that don't match production. Fixing these first does more for pipeline reliability than adding more tests.",
      "Flaky tests deserve special attention. Common causes include timing dependencies, shared test data, and calls to live external services. Quarantining flaky tests, fixing the root cause, and mocking unstable dependencies keeps a failed build meaningful.",
      "Keploy helps with several of these at once. Replaying recorded API calls against auto-generated mocks removes the dependence on live services, which cuts down flakiness and environment drift, and the generated tests add regression coverage for critical API workflows.",
    ],
    bullets: [
      "Flaky tests: intermittent failures mislead teams and waste debugging time. Fix: isolate dependencies, remove timing assumptions, and quarantine flaky tests until they're fixed",
      "Slow pipelines: large or inefficient test suites delay feedback and release cycles. Fix: run fast tests first, use selective test execution, and run suites in parallel",
      "Environment mismatches: differences between development, staging, and production cause unexpected build failures. Fix: use containers like Docker and infrastructure as code for consistent environments",
      "Insufficient test coverage: missing tests for critical scenarios let regressions reach production. Fix: prioritize high-risk workflows and add a regression test for every bug that escapes",
      "Scaling CI: growing projects need test orchestration, selective execution, and parallel runs to stay efficient. Fix: split pipelines by service and cache dependencies and build artifacts",
    ],
    ctas: [
      TRY_KEPLOY,
      { label: "Flaky Tests Guide", href: "https://keploy.io/blog/community/what-is-a-flaky-test", variant: "secondary" },
    ],
  },
];

export function getContentModalsForSlug(slug: string): ContentModalConfig[] {
  return contentModals.filter((m) => m.blogSlug === slug);
}
