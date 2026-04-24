import { NextRequest, NextResponse } from "next/server";

// Vercel Cron: runs daily at 09:00 CAT (07:00 UTC), after the fix
// Updates agent streaks based on daily reporting

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // TODO: Implement streak update
    // 1. For each agent, check if they reported yesterday
    // 2. If yes, increment their streak
    // 3. If no, reset their streak to 0
    // 4. Award bonus tickets for milestone streaks (7, 30, etc.)
    // 5. Update agents sheet with new streak values

    console.log("[CRON] Streak update triggered at", new Date().toISOString());

    return NextResponse.json({
      success: true,
      message: "Streak update not yet implemented",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Streak update error:", error);
    return NextResponse.json(
      { error: "Failed to process streak update" },
      { status: 500 }
    );
  }
}
