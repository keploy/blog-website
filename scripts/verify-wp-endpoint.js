#!/usr/bin/env node
// Quick script to verify a WordPress GraphQL endpoint.
// Usage: node scripts/verify-wp-endpoint.js [url]
// Or set env WORDPRESS_API_URL and run: node scripts/verify-wp-endpoint.js

const urlArg = process.argv[2] || process.env.WORDPRESS_API_URL;
if (!urlArg) {
  console.error('Usage: node scripts/verify-wp-endpoint.js [url]  OR set WORDPRESS_API_URL env var');
  process.exit(2);
}

const fetchJson = async (url) => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
    });

    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    if (!contentType.includes('application/json')) {
      return { ok: false, contentType, text };
    }
    try {
      const json = JSON.parse(text);
      return { ok: true, json };
    } catch (err) {
      return { ok: false, contentType: 'application/json', text };
    }
  } catch (err) {
    return { ok: false, error: String(err) };
  }
};

(async () => {
  console.log('Verifying', urlArg);
  let result = await fetchJson(urlArg);
  if (result.ok) {
    console.log('Success:', JSON.stringify(result.json, null, 2));
    process.exit(0);
  }

  // Try appending /graphql if not present
  if (!/\/graphql\/?$/i.test(urlArg)) {
    const alt = urlArg.replace(/\/$/, '') + '/graphql';
    console.log(`First attempt returned ${result.contentType || result.error}. Trying ${alt}`);
    result = await fetchJson(alt);
    if (result.ok) {
      console.log('Success at', alt, JSON.stringify(result.json, null, 2));
      process.exit(0);
    }
    console.error('Both attempts failed. Snippet/error:');
    console.error(result.text ? result.text.slice(0, 1000) : result.error);
    process.exit(1);
  }

  console.error('Attempt failed. Snippet/error:');
  console.error(result.text ? result.text.slice(0, 1000) : result.error);
  process.exit(1);
})();
