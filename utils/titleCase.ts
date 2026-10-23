// Headline title-casing for post H1s. The previous helper lowercased the whole
// string and upper-cased every \b\w, which produced "Api", "Qa", "Vs" and
// "Developer'S" (\b matches after an apostrophe). This version only touches the
// first letter of each word, keeps any word that already has an inner capital
// (API, gRPC, iOS, CI/CD, JavaScript), forces a known-acronym list to its
// canonical form, and keeps "vs" lowercase.

const ACRONYMS: Record<string, string> = {};
[
  "API", "APIs", "QA", "AI", "ML", "LLM", "LLMs", "CI", "CD", "CI/CD", "SDK",
  "SDKs", "JSON", "YAML", "XML", "UI", "UX", "HTTP", "HTTPS", "REST", "gRPC",
  "SQL", "NoSQL", "CLI", "IDE", "E2E", "TDD", "BDD", "SaaS", "AWS", "GCP",
  "K8s", "eBPF", "JWT", "OAuth", "URL", "URLs", "HTML", "CSS", "DevOps",
  "SDLC", "MCP", "SOAP", "GraphQL", "CRUD", "DB", "OSS", "PR", "PRs", "VS",
  "iOS", "macOS", "npm", "SRE", "SLA", "MVP", "ROI", "B2B", "TCP", "UDP",
  "DNS", "RPC", "GUI", "JVM", "PDF", "CSV", "ORM", "QAs",
].forEach((word) => {
  ACRONYMS[word.toLowerCase()] = word;
});
// "vs" as in "Jest vs Mocha" stays lowercase; "VS Code" is handled below.
const LOWERCASE_WORDS = new Set(["vs", "vs."]);

function caseWord(word: string, index: number, words: string[]): string {
  if (!word) return word;
  // Split off surrounding punctuation so "(API," still matches "api".
  const match = word.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/);
  if (!match) return word;
  const [, lead, core, trail] = match;
  if (!core) return word;
  const lower = core.toLowerCase();

  if (LOWERCASE_WORDS.has(lower + trail) || LOWERCASE_WORDS.has(lower)) {
    const next = words[index + 1]?.toLowerCase();
    if (lower === "vs" && next === "code") return `${lead}VS${trail}`;
    return index === 0 ? word : `${lead}${lower}${trail}`;
  }
  if (ACRONYMS[lower]) return `${lead}${ACRONYMS[lower]}${trail}`;
  // Plural/possessive acronyms: "API's", "APIs'".
  const possessive = lower.match(/^(.+?)('s|’s|s'|s’)$/);
  if (possessive && ACRONYMS[possessive[1]]) {
    return `${lead}${ACRONYMS[possessive[1]]}${core.slice(possessive[1].length)}${trail}`;
  }
  // Leave mixed-case / all-caps words (JavaScript, gRPC, NodeJS) as written.
  if (/[A-Z]/.test(core.slice(1)) || /^[a-z]+[A-Z]/.test(core)) {
    return `${lead}${core}${trail}`;
  }
  // Capitalize only the first letter; never after an apostrophe, and keep
  // the rest of the word exactly as authored ("Developer's", "don't").
  return `${lead}${core.charAt(0).toUpperCase()}${core.slice(1)}${trail}`;
}

export function toHeadlineCase(input: string): string {
  if (!input) return "";
  const words = input.split(/(\s+)/);
  const tokens = words.filter((w) => !/^\s+$/.test(w));
  let i = 0;
  return words
    .map((w) => (/^\s+$/.test(w) ? w : caseWord(w, i++, tokens)))
    .join("");
}
