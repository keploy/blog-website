import type { NextApiRequest, NextApiResponse } from "next";

// Allowlist external hosts we agree to proxy
const ALLOWED_HOSTNAMES = new Set([
  "pbs.twimg.com",
  "secure.gravatar.com",
  "keploy.io",
  "www.keploy.io",
  "wp.keploy.io",
]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const urlParam = req.query.url;

    if (typeof urlParam !== "string") {
      res.status(400).send("Missing url parameter");
      return;
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(urlParam);
    } catch {
      res.status(400).send("Invalid url parameter");
      return;
    }

    if (targetUrl.protocol !== "https:") {
      res.status(400).send("Only https protocol is allowed");
      return;
    }

    if (!ALLOWED_HOSTNAMES.has(targetUrl.hostname)) {
      res.status(403).send("Host not allowed");
      return;
    }

    const upstream = await fetch(targetUrl.toString(), {
      cache: "no-store",
      headers: {
        "User-Agent": "keploy-blog-proxy/1.0",
        Accept: "image/*",
      },
    });

    if (!upstream.ok || !upstream.body) {
      res.status(upstream.status).send("Failed to fetch image");
      return;
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const contentLength = upstream.headers.get("content-length");
    res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);

    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");

    const reader = upstream.body.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) res.write(Buffer.from(value));
    }
    res.end();
  } catch (err) {
    res.status(500).send("Unexpected error");
  }
}


