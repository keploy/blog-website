import crypto from "crypto";
import { SITE_URL } from "./structured-data";

const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_WEBMASTERS_SCOPE = "https://www.googleapis.com/auth/webmasters";
const GOOGLE_SITEMAPS_SUBMIT_BASE_URL = "https://www.googleapis.com/webmasters/v3/sites";
const GOOGLE_TOKEN_LIFETIME_SECONDS = 3600;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function base64UrlEncode(value: Buffer | string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getGooglePrivateKey() {
  return getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n");
}

function createServiceAccountJwt() {
  const clientEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const now = Math.floor(Date.now() / 1000);

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
  });

  if (!response.ok) {
    throw new Error(`Google OAuth token request failed: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as {
    access_token?: string;
  };

  if (!json.access_token) {
    throw new Error("Google OAuth token response did not include an access token");
  }

  return json.access_token;
}

function getSearchConsoleSiteUrl() {
  return getRequiredEnv("GOOGLE_SEARCH_CONSOLE_SITE_URL");
}

function getSitemapUrl() {
  return process.env.SITEMAP_PUBLIC_URL?.trim() || `${SITE_URL}/sitemap.xml`;
}

export function isSearchConsoleSubmissionConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim() &&
      process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim()
  );
}

export async function submitSitemapToSearchConsole() {
  const accessToken = await fetchGoogleAccessToken();
  const siteUrl = getSearchConsoleSiteUrl();
  const sitemapUrl = getSitemapUrl();

  const response = await fetch(
    `${GOOGLE_SITEMAPS_SUBMIT_BASE_URL}/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(
      sitemapUrl
    )}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Google Search Console sitemap submission failed: ${response.status} ${response.statusText}${
        errorBody ? ` - ${errorBody}` : ""
      }`
    );
  }

  return {
    siteUrl,
    sitemapUrl,
    submittedAt: new Date().toISOString(),
  };
}
