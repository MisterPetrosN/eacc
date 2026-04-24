import { NextRequest, NextResponse } from "next/server";

// Vercel Cron: runs every Sunday at 18:00 CAT (16:00 UTC)
// Performs the weekly lottery draw

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // TODO: Implement lottery draw
    // 1. Fetch all tickets for the current week
    // 2. Perform weighted random selection
    // 3. Record winner(s) to lottery sheet
    // 4. Reset ticket pool for next week
    // 5. Send notification to winner(s)

    console.log("[CRON] Lottery draw triggered at", new Date().toISOString());

    return NextResponse.json({
      success: true,
      message: "Lottery draw not yet implemented",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Lottery draw error:", error);
    return NextResponse.json(
      { error: "Failed to process lottery draw" },
      { status: 500 }
    );
  }
}
