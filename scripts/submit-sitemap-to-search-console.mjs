import crypto from "crypto";
import dotenv from "dotenv";

// load .env.local explicitly so this standalone script behaves like the local app
// and can reuse the same credentials without extra shell setup.
dotenv.config({ path: ".env.local" });

const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_WEBMASTERS_SCOPE = "https://www.googleapis.com/auth/webmasters";
const GOOGLE_SITEMAPS_SUBMIT_BASE_URL = "https://www.googleapis.com/webmasters/v3/sites";
const GOOGLE_TOKEN_LIFETIME_SECONDS = 3600;
const GOOGLE_FETCH_TIMEOUT_MS = 25000;
const DEFAULT_SITEMAP_URL = "https://keploy.io/blog/sitemap.xml";

function getRequiredEnv(name) {
  // fail early if any required local env var is missing.
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function base64UrlEncode(value) {
  // convert to jwt-safe base64url form.
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getGooglePrivateKey() {
  // restore newline characters so the pem key is valid for crypto signing.
  return getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n");
}

function createServiceAccountJwt() {
  const clientEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const now = Math.floor(Date.now() / 1000);

  // construct the service-account jwt the same way the app code does so this
  // script is a faithful local verification path.
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: clientEmail,
    scope: GOOGLE_WEBMASTERS_SCOPE,
    aud: GOOGLE_OAUTH_TOKEN_URL,
    exp: now + GOOGLE_TOKEN_LIFETIME_SECONDS,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  const signature = signer.sign(getGooglePrivateKey());

  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

async function fetchGoogleAccessToken() {
  // exchange the signed jwt for a short-lived oauth token.
  const assertion = createServiceAccountJwt();

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    signal: AbortSignal.timeout(GOOGLE_FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Google OAuth token request failed: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""
      }`
    );
  }

  const json = await response.json();

  if (!json.access_token) {
    throw new Error("Google OAuth token response did not include an access token");
  }

  return json.access_token;
}

async function submitSitemapToSearchConsole() {
  // get the token, the property id, and the sitemap url from local env.
  const accessToken = await fetchGoogleAccessToken();
  const siteUrl = getRequiredEnv("GOOGLE_SEARCH_CONSOLE_SITE_URL");
  const sitemapUrl = process.env.SITEMAP_PUBLIC_URL?.trim() || DEFAULT_SITEMAP_URL;

  // submit the sitemap url directly to google search console so we can verify
  // the credentials and property access without going through the cron route.
  const response = await fetch(
    `${GOOGLE_SITEMAPS_SUBMIT_BASE_URL}/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(
      sitemapUrl
    )}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(GOOGLE_FETCH_TIMEOUT_MS),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Google Search Console sitemap submission failed: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""
      }`
    );
  }

  return {
    ok: true,
    siteUrl,
    sitemapUrl,
    submittedAt: new Date().toISOString(),
  };
}

try {
  // print a compact success object so the local test result is easy to inspect.
  const result = await submitSitemapToSearchConsole();
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  // print a compact structured failure object for quick debugging.
  console.error(
    JSON.stringify(
      {
        ok: false,
        message: error instanceof Error ? error.message : String(error),
      },
      null,
      2
    )
  );
  process.exit(1);
}

