export interface BlogLead {
  email: string;
  name?: string;
  company?: string;
  designation?: string;
  source: string;
  page: string;
  assetType?: string;
  assetId?: string;
  assetTitle?: string;
  recaptchaToken: string;
}

/**
 * Fire-and-forget lead capture to the telemetry service's /blog-mql endpoint
 * (verified server-side via reCAPTCHA Enterprise assessments). Never blocks
 * or fails the caller's flow: a lost MQL is preferable to a broken UX.
 * keepalive lets the request survive navigation.
 */
// Server-side field caps (telemetry validateBlogMQLRequest) — an over-limit
// field rejects the WHOLE lead with a 400, so truncate client-side instead of
// losing the lead to an oversized page URL or a long company name.
const FIELD_CAPS: Partial<Record<keyof BlogLead, number>> = {
  email: 254,
  name: 120,
  company: 160,
  designation: 120,
  source: 80,
  page: 500,
  assetType: 80,
  assetId: 160,
  assetTitle: 200,
};

export function sendBlogLead(lead: BlogLead): void {
  const base = process.env.NEXT_PUBLIC_TELEMETRY_URL;
  if (!base) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[blog-mql] NEXT_PUBLIC_TELEMETRY_URL not set; lead capture is disabled');
    }
    return;
  }
  const payload: Record<string, string> = {};
  for (const [field, value] of Object.entries(lead)) {
    if (value === undefined) continue;
    const cap = FIELD_CAPS[field as keyof BlogLead];
    payload[field] = cap ? String(value).slice(0, cap) : String(value);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  fetch(`${base}/blog-mql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
    keepalive: true,
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok && process.env.NODE_ENV !== 'production') {
        console.debug(`[blog-mql] lead capture rejected: ${res.status} ${res.statusText}`);
      }
    })
    .catch((err) => {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[blog-mql] lead capture error:', err);
      }
    })
    .finally(() => clearTimeout(timer));
}
