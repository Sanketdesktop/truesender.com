import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// Stripe webhook: set endpoint to /api/billing/webhook?secret=STRIPE_WEBHOOK_QUERY_SECRET
// (Query-secret verification keeps this dependency-free; switch to signature
// verification with the stripe SDK when billing goes live for real.)
export async function POST(request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!process.env.STRIPE_WEBHOOK_QUERY_SECRET || secret !== process.env.STRIPE_WEBHOOK_QUERY_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const event = await request.json();
  if (event.type === "checkout.session.completed") {
    const userId = event.data?.object?.metadata?.user_id;
    const customer = event.data?.object?.customer;
    if (userId) {
      await query("UPDATE users SET plan = 'pro', stripe_customer_id = $2 WHERE id = $1", [userId, customer || null]);
    }
  }
  if (event.type === "customer.subscription.deleted") {
    const customer = event.data?.object?.customer;
    if (customer) {
      await query("UPDATE users SET plan = 'free' WHERE stripe_customer_id = $1", [customer]);
    }
  }
  return NextResponse.json({ received: true });
}
