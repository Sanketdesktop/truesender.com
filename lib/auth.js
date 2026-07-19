import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { query } from "./db";

const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
const COOKIE = "ig_session";
const WEEK = 60 * 60 * 24 * 7;

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = createHmac("sha256", SECRET).update(body).digest("base64url");
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieValue(userId) {
  return sign({ uid: userId, exp: Math.floor(Date.now() / 1000) + WEEK });
}

export const sessionCookieOptions = {
  name: COOKIE,
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: WEEK,
};

export async function currentUser() {
  const token = cookies().get(COOKIE)?.value;
  const payload = verify(token);
  if (!payload) return null;
  const res = await query("SELECT id, email, plan FROM users WHERE id = $1", [payload.uid]);
  return res.rows[0] || null;
}
