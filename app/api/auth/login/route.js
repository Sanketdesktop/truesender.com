import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { verifyPassword, sessionCookieValue, sessionCookieOptions } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const res = await query("SELECT id, password_hash FROM users WHERE email = $1", [(email || "").toLowerCase()]);
    if (!res.rows.length || !verifyPassword(password || "", res.rows[0].password_hash)) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set({ ...sessionCookieOptions, value: sessionCookieValue(res.rows[0].id) });
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
