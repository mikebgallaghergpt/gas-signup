// api/send-email.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

type SendBody = {
  to?: string;
  subject?: string;
  text?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, text } = (req.body || {}) as SendBody;
  if (!to || !subject || !text) {
    return res
      .status(400)
      .json({ error: 'Missing "to", "subject", or "text" in body' });
  }

  const DRY_RUN = String(process.env.EMAIL_DRY_RUN || "").toLowerCase() === "true";
  console.log("[send-email] payload", { to, subject, text, DRY_RUN });

  if (DRY_RUN) {
    return res.status(200).json({
      ok: true,
      dryRun: true,
      message: "Email not sent (dry-run). Logged to function logs.",
      payload: { to, subject, text },
    });
  }

  const token = process.env.POSTMARK_SERVER_TOKEN;
  const from = process.env.POSTMARK_FROM_EMAIL;
  if (!token || !from) {
    return res.status(500).json({
      error:
        "Server misconfigured: POSTMARK_SERVER_TOKEN or POSTMARK_FROM_EMAIL missing",
    });
  }

  try {
    const r = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ From: from, To: to, Subject: subject, TextBody: text }),
    });

    const data = await r.json().catch(() => ({}));
    console.log("[send-email] Postmark response", r.status, data);

    if (!r.ok) {
      return res.status(r.status).json({
        error: "Postmark send failed",
        detail: data,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("[send-email] exception", e);
    return res
      .status(500)
      .json({ error: e?.message || "Unexpected error invoking Postmark" });
  }
}
