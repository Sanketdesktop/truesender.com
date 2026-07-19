import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { hashPassword, sessionCookieValue, sessionCookieOptions } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    const existing = await query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length) {
      return NextResponse.json({ error: "An account with this email already exists. Try logging in." }, { status: 409 });
    }
    const res = await query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
      [email.toLowerCase(), hashPassword(password)]
    );
    const response = NextResponse.json({ ok: true });
    response.cookies.set({ ...sessionCookieOptions, value: sessionCookieValue(res.rows[0].id) });
    return response;
  } catch {
    return NextResponse.json({ error: "Signup failed. Please try again." }, { status: 500 });
  }
}
