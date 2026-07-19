import { NextResponse } from "next/server";
import { currentUser } from "../../../../lib/auth";

// Stripe Checkout via REST. Requires env: STRIPE_SECRET_KEY, STRIPE_PRICE_ID, APP_URL
export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json({ error: "Billing isn't configured yet." }, { status: 501 });
  }
  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": process.env.STRIPE_PRICE_ID,
    "line_items[0][quantity]": "1",
    success_url: `${process.env.APP_URL || ""}/dashboard?upgraded=1`,
    cancel_url: `${process.env.APP_URL || ""}/dashboard`,
    customer_email: user.email,
    "metadata[user_id]": String(user.id),
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const session = await res.json();
  if (!res.ok) return NextResponse.json({ error: session.error?.message || "Stripe error" }, { status: 500 });
  return NextResponse.json({ url: session.url });
}
