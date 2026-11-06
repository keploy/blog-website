/**
 * validate-schema.ts
 *
 * Sweeps the blog's rendered routes for JSON-LD structured data and lints it for
 * the classes of schema.org mistakes that pass `next build` / Google's Rich
 * Results Test but get flagged by validator.schema.org — a property used on the
 * wrong type, an invalid enum value, malformed JSON, or two nodes colliding on
 * one @id. Run it against a running app (or prod) so a bad schema change is
 * caught on the PR instead of after deploy, without clicking every page through
 * validator.schema.org by hand.
 *
 * WHY THIS EXISTS: the blog's structured data (lib/structured-data.ts) is
 * assembled per route from many builders. Real schema.org tokens used against
 * the wrong type are invisible to `tsc` and to the Rich Results Test (which
 * silently ignores unknown props) — only a per-type vocabulary lint catches
 * them. Example already live: `reviewedBy` is a WebPage-only property, but it's
 * emitted on the BlogPosting node, which validator.schema.org warns on. This
 * script encodes those lessons as rules so the same class of bug can't recur
 * unnoticed. Ported from keploy/landing's scripts/validate-schema.ts and adapted
 * to this repo (Pages Router, basePath /blog, sitemap-driven route discovery).
 *
 * USAGE:
 *   # 1. Start the app in another terminal (dev or a production build):
 *   #      npm run dev        (serves the blog at http://localhost:3000/blog)
 *   # 2. Point the validator at it and run:
 *   SCHEMA_VALIDATE_BASE_URL=http://localhost:3000 npm run validate:schema
 *   # Or sweep production directly (default origin):
 *   npm run validate:schema
 *
 * FLAGS:
 *   --all         validate every URL in public/sitemap.xml (default: sample a
 *                 few posts per section + all static hub routes)
 *   --self-test   run the built-in rule fixtures and exit (no server needed)
 *
 * Exit code is non-zero if any ERROR is found (warnings do not fail the run),
 * so it can gate a CI job or a pre-push hook.
 */

import fs from "fs";
import path from "path";

const REPO_ROOT = path.resolve(__dirname, "..");
const PAGES_DIR = path.join(REPO_ROOT, "pages");
const SITEMAP_PATH = path.join(REPO_ROOT, "public", "sitemap.xml");

// Routes in the sitemap already carry the basePath, so BASE_URL is just the
// origin. Default to prod; override for a local run.
const BASE_URL = (
  process.env.SCHEMA_VALIDATE_BASE_URL || "https://keploy.io"
).replace(/\/$/, "");
// Public origin baked into the sitemap <loc>s — stripped so a URL can be
// re-pointed at BASE_URL (e.g. localhost) for local validation.
const SITEMAP_ORIGIN = "https://keploy.io";
const BASE_PATH = "/blog";

const ALL = process.argv.includes("--all");
const SELF_TEST = process.argv.includes("--self-test");
// How many dynamic pages per section (community/technology/…) to sample when
// not running --all. Static hub routes are always validated in full.
const SAMPLE_PER_SECTION = 3;

// -------- Finding types --------
type Severity = "error" | "warning";

interface Finding {
  severity: Severity;
  rule: string;
  message: string;
  nodeType?: string;
}

// A parsed JSON-LD node plus its @type (for @id-collision reporting).
interface Node {
  data: Record<string, unknown>;
  type: string;
}

// -------- Route discovery --------
// Static (non-dynamic) routes from the Pages Router: the hub/index pages the
// sitemap doesn't necessarily distinguish, plus search. Dynamic post routes
// come from the sitemap instead (it has real slugs).
function findStaticRoutes(): string[] {
  const routes: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "api" || entry.name === "node_modules") continue;
        walk(full);
        continue;
      }
      if (!/\.(t|j)sx?$/.test(entry.name)) continue;
      const base = entry.name.replace(/\.(t|j)sx?$/, "");
      // Skip framework files and dynamic segments (handled via the sitemap).
      if (base.startsWith("_") || base === "404") continue;
      if (entry.name.includes("[")) continue;
      const rel = path.relative(PAGES_DIR, full).replace(/\.(t|j)sx?$/, "");
      const dir2 = path.dirname(rel);
      const name = path.basename(rel);
      const segs = (dir2 === "." ? "" : dir2).split(path.sep).filter(Boolean);
      if (name !== "index") segs.push(name);
      routes.push(BASE_PATH + (segs.length ? "/" + segs.join("/") : ""));
    }
  };
  walk(PAGES_DIR);
  return Array.from(new Set(routes)).sort();
}

/** All pathnames (with basePath) from public/sitemap.xml. */
function readSitemapPaths(): string[] {
  if (!fs.existsSync(SITEMAP_PATH)) return [];
  const xml = fs.readFileSync(SITEMAP_PATH, "utf8");
  const paths: string[] = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    paths.push(m[1].trim().replace(SITEMAP_ORIGIN, "") || "/");
  }
  return paths;
}

// The section is the first path segment after the basePath ("community",
// "technology", …); "" for the /blog root itself.
function sectionOf(pathname: string): string {
  const rest = pathname.replace(BASE_PATH, "").replace(/^\//, "");
  return rest.split("/")[0] || "";
}

/** Resolve the concrete list of pathnames to fetch. */
function discoverRoutes(): string[] {
  const routes = new Set<string>(findStaticRoutes());
  const sitemap = readSitemapPaths();
  if (ALL) {
    sitemap.forEach((p) => routes.add(p));
  } else {
    // Sample a few deep pages per section so every route type is exercised
    // without fetching hundreds of posts.
    const perSection = new Map<string, number>();
    for (const p of sitemap) {
      const section = sectionOf(p);
      const isDeep = p.replace(BASE_PATH, "").replace(/^\//, "").includes("/");
      if (!isDeep) {
        routes.add(p); // section index page
        continue;
      }
      const n = perSection.get(section) || 0;
      if (n < SAMPLE_PER_SECTION) {
        routes.add(p);
        perSection.set(section, n + 1);
      }
    }
  }
  return Array.from(routes).sort();
}

// -------- JSON-LD extraction --------
/** Extract every <script type="application/ld+json"> body from a page's HTML. */
export function extractJsonLdBlocks(html: string): string[] {
  const blocks: string[] = [];
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) blocks.push(m[1].trim());
  return blocks;
}

// Flatten a JSON-LD document (a single node, an array, or a { "@graph": [...] })
// into the individual typed nodes it declares.
function collectNodes(doc: unknown, into: Node[]): void {
  if (Array.isArray(doc)) {
    doc.forEach((d) => collectNodes(d, into));
    return;
  }
  if (!doc || typeof doc !== "object") return;
  const obj = doc as Record<string, unknown>;
  if (Array.isArray(obj["@graph"])) collectNodes(obj["@graph"], into);
  if (obj["@type"]) into.push({ data: obj, type: String(obj["@type"]) });
}

// The top-level node objects a document declares: array elements, @graph
// members, or the object itself. Used for the missing-@type check — a value
// object nested under a property (e.g. `mainEntityOfPage`) is NOT a top-level
// node, so this avoids false-positiving on typeless property values.
function topLevelNodes(doc: unknown): Record<string, unknown>[] {
  if (Array.isArray(doc)) return doc.flatMap(topLevelNodes);
  if (!doc || typeof doc !== "object") return [];
  const obj = doc as Record<string, unknown>;
  if (Array.isArray(obj["@graph"])) {
    const members = obj["@graph"].flatMap(topLevelNodes);
    return obj["@type"] ? [obj, ...members] : members;
  }
  return [obj];
}

// @type may be a string or an array of strings ("BlogPosting" or
// ["BlogPosting","WebPage"]). Normalize to a lowercase set for membership tests.
function typesOf(node: Node): Set<string> {
  const raw = node.data["@type"];
  const list = Array.isArray(raw) ? raw : [raw];
  return new Set(list.map((t) => String(t).toLowerCase()));
}

const ARTICLE_TYPES = new Set([
  "article",
  "blogposting",
  "techarticle",
  "newsarticle",
  "report",
]);
const isArticle = (node: Node) =>
  Array.from(typesOf(node)).some((t) => ARTICLE_TYPES.has(t));

// -------- Lint rules --------
// Each rule inspects the parsed nodes of ONE page and returns findings. Rules
// are deliberately narrow and vocabulary-specific — add new ones as new schema
// mistakes are discovered, rather than reimplementing schema.org whole.
const RULES: Array<(nodes: Node[]) => Finding[]> = [
  // R1: `eligibleCustomerType` expects a BusinessEntityType (GoodRelations
  // enum), NOT a schema.org URI. A `schema.org/...` value is always invalid.
  // Not used on the blog today; kept for parity with landing + future-proofing.
  (nodes) => {
    const out: Finding[] = [];
    const walk = (o: unknown, type: string): void => {
      if (!o || typeof o !== "object") return;
      if (Array.isArray(o)) return o.forEach((x) => walk(x, type));
      const rec = o as Record<string, unknown>;
      const v = rec.eligibleCustomerType;
      if (typeof v === "string" && /schema\.org/.test(v)) {
        out.push({
          severity: "error",
          rule: "eligibleCustomerType-schemaorg-value",
          nodeType: type,
          message: `eligibleCustomerType="${v}" is invalid: it expects a BusinessEntityType (GoodRelations, e.g. http://purl.org/goodrelations/v1#Business) — no schema.org value is valid. Drop it or use a GoodRelations URI.`,
        });
      }
      Object.values(rec).forEach((val) => walk(val, type));
    };
    nodes.forEach((n) => walk(n.data, n.type));
    return out;
  },

  // R2: `codeRepository` / `programmingLanguage` are SoftwareSourceCode
  // properties, not SoftwareApplication. The blog emits both node types, so
  // this guards the global SoftwareApplication node against drift.
  (nodes) => {
    const out: Finding[] = [];
    for (const n of nodes) {
      if (!typesOf(n).has("softwareapplication")) continue;
      for (const prop of ["codeRepository", "programmingLanguage"]) {
        if (prop in n.data) {
          out.push({
            severity: "warning",
            rule: "softwareapplication-wrong-prop",
            nodeType: n.type,
            message: `"${prop}" is not valid on SoftwareApplication (it belongs on SoftwareSourceCode). Move it or drop it.`,
          });
        }
      }
    }
    return out;
  },

  // R3: two nodes on the same page sharing an @id but with different @type is
  // an entity collision. A given @id must identify exactly one node.
  (nodes) => {
    const seen = new Map<string, string>();
    const out: Finding[] = [];
    for (const n of nodes) {
      const id = n.data["@id"];
      if (typeof id !== "string") continue;
      const prev = seen.get(id);
      if (prev && prev !== n.type) {
        out.push({
          severity: "warning",
          rule: "duplicate-id",
          nodeType: n.type,
          message: `@id "${id}" is declared by both <${prev}> and <${n.type}> on this page. A given @id should identify exactly one node.`,
        });
      } else if (!prev) {
        seen.set(id, n.type);
      }
    }
    return out;
  },

  // R5 (blog-specific): `reviewedBy` is a WebPage-only property in schema.org,
  // but the blog emits it on the Article/BlogPosting/TechArticle node. That's
  // the warning validator.schema.org raises on live post pages. It's an
  // E-E-A-T signal, so this is a warning (non-failing) — to clear it, move
  // reviewedBy onto a WebPage node (e.g. mainEntityOfPage).
  (nodes) => {
    const out: Finding[] = [];
    for (const n of nodes) {
      if (!("reviewedBy" in n.data)) continue;
      if (typesOf(n).has("webpage")) continue;
      out.push({
        severity: "warning",
        rule: "reviewedby-non-webpage",
        nodeType: n.type,
        message: `"reviewedBy" is a WebPage-only property in schema.org but appears on <${n.type}>. validator.schema.org warns on this. Move it to a WebPage node (e.g. mainEntityOfPage) to clear the warning.`,
      });
    }
    return out;
  },

  // R6 (blog-specific): an Article-family node should carry both a headline and
  // a datePublished. The builder always sets headline + image, and omits
  // datePublished only when WordPress gives no usable date — a "recommended"
  // gap worth surfacing (warning, not error).
  (nodes) => {
    const out: Finding[] = [];
    for (const n of nodes) {
      if (!isArticle(n)) continue;
      for (const field of ["headline", "datePublished"]) {
        const v = n.data[field];
        if (v === undefined || v === null || v === "") {
          out.push({
            severity: "warning",
            rule: "article-missing-recommended-field",
            nodeType: n.type,
            message: `<${n.type}> is missing "${field}" (recommended for Article-type rich results).`,
          });
        }
      }
    }
    return out;
  },
];

/** Lint one page's raw JSON-LD blocks. Pure — safe to unit-test with fixtures. */
export function lintBlocks(blocks: string[]): Finding[] {
  const findings: Finding[] = [];
  const nodes: Node[] = [];
  blocks.forEach((raw, i) => {
    let doc: unknown;
    try {
      doc = JSON.parse(raw);
    } catch (e) {
      findings.push({
        severity: "error",
        rule: "malformed-json",
        message: `JSON-LD block #${i + 1} is not valid JSON: ${
          (e as Error).message
        }`,
      });
      return;
    }
    // R4: every top-level node needs an @type (a typeless top-level node is a
    // spread/copy-paste mistake and won't be recognised by any consumer).
    for (const node of topLevelNodes(doc)) {
      if (!node["@type"]) {
        findings.push({
          severity: "error",
          rule: "missing-type",
          message: `JSON-LD block #${i + 1} has a top-level node with no @type and cannot be recognised.`,
        });
      }
    }
    collectNodes(doc, nodes);
  });
  for (const rule of RULES) findings.push(...rule(nodes));
  return findings;
}

// -------- Self-test (no server needed) --------
function selfTest(): number {
  const badEligible = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    offers: {
      "@type": "Offer",
      eligibleCustomerType: "https://schema.org/Business",
    },
  });
  const badSoftware = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    codeRepository: "https://github.com/keploy/keploy",
    programmingLanguage: ["Go"],
  });
  const reviewedByOnPost = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "X",
    datePublished: "2026-01-01",
    reviewedBy: { "@type": "Person", name: "R" },
  });
  const articleNoDate = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "X",
  });
  const good = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [{ "@type": "Question", name: "Is Keploy free?" }],
  });

  let ok = true;
  const expectRule = (blocks: string[], rule: string, label: string) => {
    const hit = lintBlocks(blocks).some((f) => f.rule === rule);
    console.log(`${hit ? "PASS" : "FAIL"}  ${label}`);
    if (!hit) ok = false;
  };
  const expectClean = (blocks: string[], label: string) => {
    const findings = lintBlocks(blocks);
    console.log(`${findings.length === 0 ? "PASS" : "FAIL"}  ${label}`);
    if (findings.length !== 0) ok = false;
  };

  expectRule([badEligible], "eligibleCustomerType-schemaorg-value", "flags invalid eligibleCustomerType");
  expectRule([badSoftware], "softwareapplication-wrong-prop", "flags codeRepository/programmingLanguage on SoftwareApplication");
  expectRule(["{ not json }"], "malformed-json", "flags malformed JSON");
  expectRule([JSON.stringify({ "@context": "https://schema.org", name: "no type" })], "missing-type", "flags a top-level node with no @type");
  expectRule([reviewedByOnPost], "reviewedby-non-webpage", "flags reviewedBy on a non-WebPage node");
  expectRule([articleNoDate], "article-missing-recommended-field", "flags Article missing datePublished");
  expectClean([good], "clean FAQPage produces no findings");

  console.log(ok ? "\nself-test: all passed" : "\nself-test: FAILURES");
  return ok ? 0 : 1;
}

// -------- Live sweep --------
async function run(): Promise<number> {
  const routes = discoverRoutes();
  console.log(
    `Validating ${routes.length} routes against ${BASE_URL}` +
      (ALL ? " (--all)" : ` (sampling ${SAMPLE_PER_SECTION}/section)`) +
      "\n",
  );

  let errorCount = 0;
  let warningCount = 0;
  let unreachable = 0;

  for (const route of routes) {
    const url = `${BASE_URL}${route}`;
    let html: string;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`SKIP  ${route}  (HTTP ${res.status})`);
        unreachable++;
        continue;
      }
      html = await res.text();
    } catch (e) {
      console.log(`SKIP  ${route}  (${(e as Error).message})`);
      unreachable++;
      continue;
    }

    const findings = lintBlocks(extractJsonLdBlocks(html));
    if (findings.length === 0) {
      console.log(`OK    ${route}`);
      continue;
    }
    console.log(`ISSUE ${route}`);
    for (const f of findings) {
      const tag = f.severity === "error" ? "  ERROR  " : "  warn   ";
      const where = f.nodeType ? ` [${f.nodeType}]` : "";
      console.log(`     ${tag}${f.rule}${where}: ${f.message}`);
      if (f.severity === "error") errorCount++;
      else warningCount++;
    }
  }

  console.log(
    `\nDone. ${errorCount} error(s), ${warningCount} warning(s)` +
      (unreachable ? `, ${unreachable} unreachable` : ""),
  );
  if (unreachable === routes.length) {
    console.log(
      `\nAll routes were unreachable — is the app running at ${BASE_URL}? ` +
        `Start it with "npm run dev" or set SCHEMA_VALIDATE_BASE_URL.`,
    );
    return 1;
  }
  return errorCount > 0 ? 1 : 0;
}

async function main() {
  const code = SELF_TEST ? selfTest() : await run();
  process.exit(code);
}

// Only run when invoked directly (not when imported by the unit test).
if (require.main === module) {
  main();
}
