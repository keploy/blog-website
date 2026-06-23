import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

const DB_NAME = "keploy_mql";
const COLLECTION = "report_leads";

type SuccessResponse = { success: true };
type ErrorResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, reportId } = req.body ?? {};

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Valid email is required." });
  }

  if (!reportId || typeof reportId !== "string") {
    return res.status(400).json({ error: "Report ID is required." });
  }

  const doc = {
    email: email.trim().toLowerCase(),
    reportId: reportId.trim(),
    page: req.headers.referer ?? "",
    requestedAt: new Date(),
  };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection(COLLECTION).insertOne(doc);
    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    console.error("[request-report] MongoDB insert failed:", err);
    return res.status(500).json({ error: "Failed to save request. Please try again." });
  }
}
