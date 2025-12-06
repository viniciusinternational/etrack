import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PermissionModule, PermissionAction } from "@/lib/permission-constants";
import { checkUserPermission } from "@/lib/permissions";
import { getUserInfoFromHeaders } from "@/lib/audit-logger";

const assignPermissionSchema = z.object({
  permissionIds: z.array(z.string()).min(1, "At least one permission ID is required"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = getUserInfoFromHeaders(request.headers);

    // Check if user has permission to view user permissions
    const hasPermission = await checkUserPermission(userId, PermissionModule.USER, PermissionAction.READ);
    if (!hasPermission) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get user's permissions
    const userPermissions = await prisma.userPermission.findMany({
      where: { userId: id },
      include: {
        permission: true,
      },
      orderBy: {
        permission: {
          module: "asc",
        },
      },
    });

    // Also get all available permissions to show which ones are assigned
    const allPermissions = await prisma.permission.findMany({
      orderBy: [
        { module: "asc" },
        { action: "asc" },
      ],
    });

    const assignedPermissionIds = new Set(userPermissions.map((up) => up.permissionId));

    return NextResponse.json({
      ok: true,
      data: {
        userPermissions: userPermissions.map((up) => ({
          id: up.id,
          permissionId: up.permission.id,
          module: up.permission.module,
          action: up.permission.action,
          description: up.permission.description,
        })),
        allPermissions: allPermissions.map((p) => ({
          id: p.id,
          module: p.module,
          action: p.action,
          description: p.description,
          assigned: assignedPermissionIds.has(p.id),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch user permissions" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = getUserInfoFromHeaders(request.headers);

    // Check if user has permission to assign permissions
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

    const body = await request.json();
    const validatedData = assignPermissionSchema.parse(body);

    // Verify all permission IDs exist
    const permissions = await prisma.permission.findMany({
      where: {
        id: { in: validatedData.permissionIds },
      },
    });

    if (permissions.length !== validatedData.permissionIds.length) {
      return NextResponse.json(
        { ok: false, error: "One or more permission IDs are invalid" },
        { status: 400 }
      );
    }

    // Get existing user permissions
    const existingPermissions = await prisma.userPermission.findMany({
      where: { userId: id },
      select: { permissionId: true },
    });

    const existingPermissionIds = new Set(existingPermissions.map((ep) => ep.permissionId));

    // Find permissions to add (not already assigned)
    const permissionsToAdd = validatedData.permissionIds.filter(
      (pid) => !existingPermissionIds.has(pid)
    );

    // Add new permissions
    if (permissionsToAdd.length > 0) {
      await prisma.userPermission.createMany({
        data: permissionsToAdd.map((permissionId) => ({
          userId: id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }

    // Get updated user permissions
    const updatedPermissions = await prisma.userPermission.findMany({
      where: { userId: id },
      include: {
        permission: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: updatedPermissions.map((up) => ({
        id: up.id,
        permissionId: up.permission.id,
        module: up.permission.module,
        action: up.permission.action,
        description: up.permission.description,
      })),
      message: `Assigned ${permissionsToAdd.length} permission(s)`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error assigning permissions:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to assign permissions" },
      { status: 500 }
    );
  }
}

