import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePassword, hashPassword } from "@/lib/password";
import { checkUserPermission } from "@/lib/permissions";
import { PermissionModule, PermissionAction } from "@/lib/permission-constants";
import { getUserInfoFromHeaders, createAuditLog } from "@/lib/audit-logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = getUserInfoFromHeaders(request.headers);

    // Check if user has permission to update users
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

    // Generate new password
    const newPassword = generatePassword();
    const passwordHash = hashPassword(newPassword);

    // Update user with new password and set mustChangePassword flag
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        password: passwordHash,
        mustChangePassword: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        mustChangePassword: true,
      },
    });

    // Audit log
    try {
      const headersList = request.headers;
      const { userSnapshot } = getUserInfoFromHeaders(headersList);
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "UPDATE",
        entityType: "User",
        entityId: updatedUser.id,
        description: `Generated new password for user ${updatedUser.email}`,
        newData: { mustChangePassword: true },
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    // Return the generated password (only shown once, should be securely shared)
    return NextResponse.json({
      ok: true,
      data: {
        user: updatedUser,
        generatedPassword: newPassword,
        message: "Password generated successfully. User must change password on next login.",
      },
    });
  } catch (error) {
    console.error("Error generating password:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to generate password" },
      { status: 500 }
    );
  }
}

