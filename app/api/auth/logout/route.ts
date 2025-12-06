import { NextRequest, NextResponse } from "next/server";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";

export async function POST(request: NextRequest) {
  try {
    const { userId, userSnapshot } = getUserInfoFromHeaders(request.headers);

    // Create audit log for logout
    if (userId) {
      try {
        const headersList = request.headers;
        const ip = headersList.get("x-forwarded-for") ?? undefined;

        await createAuditLog({
          userId,
          userSnapshot,
          actionType: "LOGOUT",
          entityType: "User",
          entityId: userId,
          description: `User logged out`,
          ipAddress: ip,
          userAgent: headersList.get("user-agent") ?? undefined,
        });
      } catch (e) {
        console.error("Audit log failed", e);
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to process logout request" },
      { status: 500 }
    );
  }
}

