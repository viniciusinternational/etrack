import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-permissions";
import { ALL_PERMISSION_KEYS, getModuleFromPermissionKey, getActionFromPermissionKey } from "@/types/permissions";

/**
 * Permission definition for API response
 */
interface PermissionDefinition {
  key: string;
  module: string;
  action: string;
  description?: string;
}

/**
 * Get all available permissions from static definitions
 * Returns permissions grouped by module
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication (any authenticated user can view permissions)
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Build permission definitions from static keys
    const permissions: PermissionDefinition[] = ALL_PERMISSION_KEYS.map((key) => ({
      key,
      module: getModuleFromPermissionKey(key),
      action: getActionFromPermissionKey(key),
    }));

    // Group permissions by module
    const grouped = permissions.reduce((acc: Record<string, PermissionDefinition[]>, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {} as Record<string, PermissionDefinition[]>);

    return NextResponse.json({ ok: true, data: grouped, all: permissions });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

