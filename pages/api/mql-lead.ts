import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

const DB_NAME = "keploy_mql";
const COLLECTION = "mql_leads";

type LeadPayload = {
  name: string;
  email: string;
  company?: string;
  designation?: string;
  source?: string;
  page?: string;
};

type SuccessResponse = { success: true };
type ErrorResponse = { error: string };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    name,
    email,
    company = "",
    designation = "",
    source = "unknown",
    page = "",
  } = req.body as LeadPayload;

  // Validate required fields
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Name is required." });
  }
  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ error: "Email is required." });
  }
  if (!isValidEmail(email.trim())) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  const doc = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    company: company.trim(),
    designation: designation.trim(),
    source: source.trim(),
    page: page.trim(),
    submittedAt: new Date(),
  };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection(COLLECTION).insertOne(doc);
    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    console.error("[mql-lead] MongoDB insert failed:", err);
    return res.status(500).json({ error: "Failed to save lead. Please try again." });
  }
}
