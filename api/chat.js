// Vercel serverless proxy for Anthropic API
// Keeps ANTHROPIC_API_KEY server-side — never exposed to the browser
// Requires Google Sign-In token from venturebuilder.vc domain

import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (payload.hd !== "venturebuilder.vc") {
    throw new Error(`Domain ${payload.hd || "unknown"} not allowed`);
  }
  return payload;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Auth check ──────────────────────────────────────────────────────────────
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authentication token" });
  }
  try {
    await verifyGoogleToken(auth.slice(7));
  } catch (err) {
    return res.status(403).json({ error: "Unauthorized: " + err.message });
  }

  // ── Proxy to Anthropic ──────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured on server" });
  }

  try {
    const { model, max_tokens, system, messages } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens, system, messages }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
