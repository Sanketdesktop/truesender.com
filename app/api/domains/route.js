import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { query } from "../../../lib/db";
import { currentUser } from "../../../lib/auth";

const FREE_DOMAIN_LIMIT = parseInt(process.env.FREE_DOMAIN_LIMIT || "3", 10);

export async function POST(request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  try {
    const { domain } = await request.json();
    const clean = (domain || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(clean)) {
      return NextResponse.json({ error: "That doesn't look like a valid domain." }, { status: 400 });
    }
    if (user.plan === "free") {
      const count = await query("SELECT count(*)::int AS n FROM domains WHERE user_id = $1", [user.id]);
      if (count.rows[0].n >= FREE_DOMAIN_LIMIT) {
        return NextResponse.json({ error: `The free plan includes ${FREE_DOMAIN_LIMIT} domains during early access. Higher limits are coming — reply to any of our emails if you need more now.` }, { status: 402 });
      }
    }
    const token = randomBytes(8).toString("hex");
    const res = await query(
      "INSERT INTO domains (user_id, domain, ingest_token) VALUES ($1, $2, $3) ON CONFLICT (user_id, domain) DO UPDATE SET domain = EXCLUDED.domain RETURNING id, domain, ingest_token",
      [user.id, clean, token]
    );
    return NextResponse.json(res.rows[0]);
  } catch {
    return NextResponse.json({ error: "Could not add domain." }, { status: 500 });
  }
}
