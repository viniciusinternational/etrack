import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PermissionModule, PermissionAction, ALL_PERMISSIONS } from "@/lib/permission-constants";
import { checkUserPermission } from "@/lib/permissions";
import { getUserInfoFromHeaders } from "@/lib/audit-logger";

const createPermissionSchema = z.object({
  module: z.nativeEnum(PermissionModule),
  action: z.nativeEnum(PermissionAction),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Get current user from headers (you may need to adjust this based on your auth setup)
    const { userId } = getUserInfoFromHeaders(request.headers);
    
    // Check if user has permission to view permissions
    // For now, allow all authenticated users to view permissions
    // You can add permission check here if needed: await checkUserPermission(userId, PermissionModule.USER, PermissionAction.READ)

    const permissions = await prisma.permission.findMany({
      orderBy: [
        { module: "asc" },
        { action: "asc" },
      ],
    });

    // Group permissions by module
    const grouped = permissions.reduce((acc: Record<string, typeof permissions>, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return NextResponse.json({ ok: true, data: grouped, all: permissions });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getUserInfoFromHeaders(request.headers);
    
    // Check authentication and permission
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: User not authenticated" },
        { status: 401 }
      );
    }
    const hasPermission = await checkUserPermission(userId, PermissionModule.USER, PermissionAction.CREATE);
    if (!hasPermission) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createPermissionSchema.parse(body);

    // Check if permission already exists
    const existing = await prisma.permission.findUnique({
      where: {
        module_action: {
          module: validatedData.module,
          action: validatedData.action,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Permission already exists" },
        { status: 400 }
      );
    }

    const newPermission = await prisma.permission.create({
      data: {
        module: validatedData.module,
        action: validatedData.action,
        description: validatedData.description,
      },
    });

    return NextResponse.json({ ok: true, data: newPermission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating permission:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create permission" },
      { status: 500 }
    );
  }
}

