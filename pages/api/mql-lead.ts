import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

const DB_NAME = "keploy_mql";
const COLLECTION = "mql_leads";

type LeadPayload = {
  name: string;
  email: string;
  company: string;
  designation: string;
  source: string;
  page: string;
};

type SuccessResponse = { success: true };
type ErrorResponse = { error: string };

const FIELD_LIMITS = {
  name: 120,
  email: 254,
  company: 160,
  designation: 120,
  source: 80,
  page: 500,
} as const;

// keep this simple for now, we only need to catch obvious bad emails.
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// req.body is user controlled, so check the shape before reading fields from it.
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// mongodb uses code 11000 for unique index conflicts.
function isDuplicateKeyError(err: unknown): boolean {
  return isPlainObject(err) && err.code === 11000;
}

function getStringField(
  body: Record<string, unknown>,
  field: keyof typeof FIELD_LIMITS,
  options: { required?: boolean; defaultValue?: string } = {}
): { value: string; error?: string } {
  const rawValue = body[field];

  // optional fields can be missing, but required fields must have real text.
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    if (options.required) {
      return { value: "", error: `${field} is required.` };
    }
    return { value: options.defaultValue ?? "" };
  }

  if (typeof rawValue !== "string") {
    return { value: "", error: `${field} must be a string.` };
  }

  const value = rawValue.trim();

  if (options.required && !value) {
    return { value: "", error: `${field} is required.` };
  }

  if (value.length > FIELD_LIMITS[field]) {
    return {
      value: "",
      error: `${field} must be ${FIELD_LIMITS[field]} characters or fewer.`,
    };
  }

  return { value };
}

function parseLeadPayload(body: unknown): { payload?: LeadPayload; error?: string } {
  if (!isPlainObject(body)) {
    return { error: "Invalid request body." };
  }

  // normalize everything in one place before creating the database document.
  const name = getStringField(body, "name", { required: true });
  if (name.error) return { error: "Name is required." };

  const email = getStringField(body, "email", { required: true });
  if (email.error) return { error: "Email is required." };

  const normalizedEmail = email.value.toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return { error: "Invalid email address." };
  }

  const company = getStringField(body, "company");
  if (company.error) return { error: company.error };

  const designation = getStringField(body, "designation");
  if (designation.error) return { error: designation.error };

  const source = getStringField(body, "source", { defaultValue: "unknown" });
  if (source.error) return { error: source.error };

  const page = getStringField(body, "page");
  if (page.error) return { error: page.error };

  return {
    payload: {
      name: name.value,
      email: normalizedEmail,
      company: company.value,
      designation: designation.value,
      source: source.value || "unknown",
      page: page.value,
    },
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { payload, error } = parseLeadPayload(req.body);
  if (error || !payload) {
    return res.status(400).json({ error: error || "Invalid request body." });
  }

  const now = new Date();
  const doc = {
    ...payload,
    status: "new",
    submittedAt: now,
    updatedAt: now,
  };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection(COLLECTION).insertOne(doc);
    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    // this only works after the email field has a unique index in mongodb.
    if (isDuplicateKeyError(err)) {
      return res.status(409).json({
        error: "Email already submitted. We'll get back to you over email.",
      });
    }

    console.error("[mql-lead] MongoDB insert failed:", err);
    return res.status(500).json({ error: "Failed to save lead. Please try again." });
  }
}
