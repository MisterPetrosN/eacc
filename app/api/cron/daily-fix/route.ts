import { NextRequest, NextResponse } from "next/server";

// Vercel Cron: runs daily at 08:00 CAT (06:00 UTC)
// Calculates and publishes the daily price fix

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // TODO: Implement daily fix calculation
    // 1. Fetch all reports from the past 24 hours
    // 2. Calculate median prices per market/commodity
    // 3. Flag outliers for manual review
    // 4. Update the "prices" sheet with new fix
    // 5. Log the fix to audit trail

    console.log("[CRON] Daily fix triggered at", new Date().toISOString());

    return NextResponse.json({
      success: true,
      message: "Daily fix calculation not yet implemented",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Daily fix error:", error);
    return NextResponse.json(
      { error: "Failed to process daily fix" },
      { status: 500 }
    );
  }
}
