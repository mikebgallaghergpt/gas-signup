// api/send-email.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

type SendBody = {
  to?: string;
  subject?: string;
  text?: string;
};

// (Optional) very light CORS for browser calls during dev.
// If you don't need cross-origin calls, you can remove these headers.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle preflight quickly
  if (req.method === "OPTIONS") {
    return res.status(204).setHeader("Access-Control-Max-Age", "86400").setHeader("Access-Control-Allow-Origin", "*").end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .setHeader("Allow", "POST,OPTIONS")
      .json({ error: "Method not allowed" });
  }

  // Resolve env + DRY_RUN (defaults to true while Postmark is under review)
  const DRY_RUN =
    String(process.env.EMAIL_DRY_RUN ?? "true").toLowerCase() === "true";
  const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
  const FROM = process.env.POSTMARK_FROM_EMAIL;

  // Top-of-function breadcrumbs
  console.log("[send-email] invoked", {
    dryRun: DRY_RUN,
    hasToken: Boolean(POSTMARK_TOKEN),
    hasFrom: Boolean(FROM),
  });

  // Parse & validate
  const { to, subject, text } = (req.body || {}) as SendBody;
  if (!to || !subject || !text) {
    console.warn("[send-email] missing fields", { to: !!to, subject: !!subject, text: !!text });
    return res
      .status(400)
      .setHeader("Content-Type", "application/json")
      .json({ error: "Missing 'to', 'subject', or 'text' in body" });
  }

  // Always log the payload shape (not secrets) so we can trace submissions
  console.log("[send-email] payload", { to, subject, textLen: text.length });

  // DRY-RUN → simulate success (no external call)
  if (DRY_RUN) {
    console.log("[send-email] DRY_RUN=true → not contacting Postmark");
    return res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .json({
        ok: true,
        dryRun: true,
        message: "Simulated send (Postmark not contacted).",
        echo: { to, subject, text },
      });
  }

  // From this point, we intend to send via Postmark
  if (!POSTMARK_TOKEN || !FROM) {
    console.error("[send-email] Missing Postmark env vars", {
      missingToken: !POSTMARK_TOKEN,
      missingFrom: !FROM,
    });
    return res
      .status(500)
      .json({ error: "Email service not configured (missing env vars)." });
  }

  try {
    const r = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": POSTMARK_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        From: FROM,
        To: to,
        Subject: subject,
        TextBody: text,
      }),
    });

    let data: unknown = null;
    try {
      data = await r.json();
    } catch {
      // Non-JSON body; keep data as null
    }

    console.log("[send-email] postmark response", { status: r.status, data });

    if (!r.ok) {
      return res
        .status(r.status)
        .setHeader("Content-Type", "application/json")
        .json({ error: "Postmark send failed", details: data });
    }

    return res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .json({ ok: true, data });
  } catch (err: any) {
    console.error("[send-email] unexpected error", {
      message: err?.message,
      stack: err?.stack,
    });
    return res
      .status(500)
      .setHeader("Content-Type", "application/json")
      .json({ error: "Unexpected error while sending email." });
  }
}