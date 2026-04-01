export function trackAiReferral(): void {
  if (typeof window === "undefined") return;

  // Referrer domain → AI source name
  const aiReferrerDomains: Record<string, string> = {
    "chatgpt.com": "ChatGPT",
    "chat.openai.com": "ChatGPT",
    "perplexity.ai": "Perplexity",
    "claude.ai": "Claude",
    "gemini.google.com": "Gemini",
    "copilot.microsoft.com": "Copilot",
    "meta.ai": "MetaAI",
    "you.com": "YouChat",
    "phind.com": "Phind",
    "poe.com": "Poe",
  };

  // Explicit utm_source tokens → AI source name
  // Exact match only — no substring matching to avoid false positives.
  const aiUtmTokens: Record<string, string> = {
    "chatgpt": "ChatGPT",
    "openai": "ChatGPT",
    "perplexity": "Perplexity",
    "claude": "Claude",
    "anthropic": "Claude",
    "gemini": "Gemini",
    "copilot": "Copilot",
    "bing_chat": "Copilot",
    "meta_ai": "MetaAI",
    "youchat": "YouChat",
    "phind": "Phind",
    "poe": "Poe",
  };

  const referrer = document.referrer.toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = (urlParams.get("utm_source") || "").toLowerCase().trim();

  let aiSource: string | null = null;
  let attributionMethod: "referrer" | "utm" | null = null;

  // 1. Check referrer against known AI domains
  for (const [domain, name] of Object.entries(aiReferrerDomains)) {
    if (referrer.includes(domain)) {
      aiSource = name;
      attributionMethod = "referrer";
      break;
    }
  }

  // 2. Fall back to explicit UTM token matching (exact match only)
  if (!aiSource && utmSource) {
    const matched = aiUtmTokens[utmSource];
    if (matched) {
      aiSource = matched;
      attributionMethod = "utm";
    }
  }

  if (aiSource && attributionMethod) {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "ai_referral",
      ai_source: aiSource,
      ai_citation_type: attributionMethod === "referrer" ? "direct_citation" : "utm_attributed",
      ai_landing_content: window.location.pathname,
    });
  }
}
