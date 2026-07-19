import { NextResponse } from "next/server";
import { runFullCheck } from "../../../lib/dns-checks";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain") || "";

  if (!domain || domain.length > 253) {
    return NextResponse.json({ error: "Please provide a domain." }, { status: 400 });
  }

  try {
    const result = await Promise.race([
      runFullCheck(domain),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 25000)
      ),
    ]);
    if (result.error) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong running the check. Please try again." },
      { status: 500 }
    );
  }
}
