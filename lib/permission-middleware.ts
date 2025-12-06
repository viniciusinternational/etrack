import { NextRequest, NextResponse } from "next/server";
import { PermissionModule, PermissionAction } from "./permission-constants";
import { checkUserPermission } from "./permissions";
import { getUserInfoFromHeaders } from "./audit-logger";

/**
 * Middleware helper to check permissions in API routes
 */
export async function requirePermission(
  request: NextRequest,
  module: PermissionModule,
  action: PermissionAction
): Promise<{ authorized: boolean; userId?: string; error?: NextResponse }> {
  try {
    const { userId } = getUserInfoFromHeaders(request.headers);

    if (!userId) {
      return {
        authorized: false,
        error: NextResponse.json(
          { ok: false, error: "Unauthorized: User not authenticated" },
          { status: 401 }
        ),
      };
    }

    const hasPermission = await checkUserPermission(userId, module, action);

    if (!hasPermission) {
      return {
        authorized: false,
        userId,
        error: NextResponse.json(
          { ok: false, error: "Unauthorized: Insufficient permissions" },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, userId };
  } catch (error) {
    console.error("Error checking permission:", error);
    return {
      authorized: false,
      error: NextResponse.json(
        { ok: false, error: "Internal server error" },
        { status: 500 }
      ),
    };
  }
}

