import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, reportId } = req.body ?? {};

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  if (!reportId || typeof reportId !== "string") {
    return res.status(400).json({ error: "Report ID is required" });
  }

  // TODO: wire to your email delivery service (HubSpot, Mailchimp, etc.)
  // Example HubSpot form submission:
  //   await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ fields: [{ name: "email", value: email }] }),
  //   });
  console.log(`[request-report] email=${email.trim()} reportId=${reportId}`);

  return res.status(200).json({ success: true });
}
