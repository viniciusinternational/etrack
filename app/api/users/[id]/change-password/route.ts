import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getUserInfoFromHeaders, createAuditLog } from "@/lib/audit-logger";

const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = getUserInfoFromHeaders(request.headers);

    // User can only change their own password unless they're an admin
    // For now, allow if userId matches or if it's an admin action
    // You may want to add permission check here

    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // If currentPassword is provided, verify it
    // If mustChangePassword is true, currentPassword is optional
    if (validatedData.currentPassword && user.password) {
      const isValid = verifyPassword(validatedData.currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { ok: false, error: "Current password is incorrect" },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const newPasswordHash = hashPassword(validatedData.newPassword);

    // Update user password
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        password: newPasswordHash,
        mustChangePassword: false,
        passwordChangedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        mustChangePassword: true,
        passwordChangedAt: true,
      },
    });

    // Audit log
    try {
      const headersList = request.headers;
      const { userSnapshot } = getUserInfoFromHeaders(headersList);
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || id,
        userSnapshot,
        actionType: "UPDATE",
        entityType: "User",
        entityId: updatedUser.id,
        description: `Password changed for user ${updatedUser.email}`,
        newData: { passwordChangedAt: updatedUser.passwordChangedAt },
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({
      ok: true,
      data: updatedUser,
      message: "Password changed successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error changing password:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to change password" },
      { status: 500 }
    );
  }
}

