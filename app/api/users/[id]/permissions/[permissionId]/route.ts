import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PermissionModule, PermissionAction } from "@/lib/permission-constants";
import { checkUserPermission } from "@/lib/permissions";
import { getUserInfoFromHeaders } from "@/lib/audit-logger";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; permissionId: string }> }
) {
  try {
    const { id, permissionId } = await params;
    const { userId } = getUserInfoFromHeaders(request.headers);

    // Check if user has permission to remove permissions
    const hasPermission = await checkUserPermission(userId, PermissionModule.USER, PermissionAction.UPDATE);
    if (!hasPermission) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Insufficient permissions" },
        { status: 403 }
      );
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      return NextResponse.json(
        { ok: false, error: "Permission not found" },
        { status: 404 }
      );
    }

    // Remove the user permission
    await prisma.userPermission.delete({
      where: {
        userId_permissionId: {
          userId: id,
          permissionId,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Permission removed successfully",
    });
  } catch (error) {
    console.error("Error removing permission:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to remove permission" },
      { status: 500 }
    );
  }
}

