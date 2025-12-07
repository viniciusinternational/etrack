import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { UserRole } from "@prisma/client";
import { requireAuth } from "@/lib/api-permissions";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  mdaId: z.string().optional(),
  status: z.string().optional(),
  password: z.string().optional(),
  mustChangePassword: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mdaId: true,
        status: true,
        mustChangePassword: true,
        passwordChangedAt: true,
        lastLogin: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
        mda: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        // Include counts or other relations if needed by frontend
        _count: {
          select: {
            contractorProjects: true,
            submittedMilestones: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    const userWithMdaName = {
      ...user,
      mdaName: user.mda?.name,
      status: user.status,
    };

    return NextResponse.json({ ok: true, data: userWithMdaName });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if user has permission to update users
    const authResult = await requireAuth(request, ['edit_user']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    // Handle password update
    const updateData: any = { ...validatedData };
    if (validatedData.password) {
      const { hashPassword } = await import("@/lib/password");
      updateData.password = hashPassword(validatedData.password);
      // If password is being set, user must change it on next login
      if (validatedData.mustChangePassword === undefined) {
        updateData.mustChangePassword = true;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mdaId: true,
        status: true,
        mustChangePassword: true,
        passwordChangedAt: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    try {
      const headersList = request.headers;
      const { userSnapshot } = getUserInfoFromHeaders(headersList);
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: user.id,
        userSnapshot,
        actionType: "UPDATE",
        entityType: "User",
        entityId: updatedUser.id,
        description: `Updated user ${updatedUser.email}`,
        previousData: existingUser,
        newData: updatedUser,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating user:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    await prisma.user.delete({ where: { id } });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "DELETE",
        entityType: "User",
        entityId: id,
        description: `Deleted user ${id}`,
        previousData: existingUser,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: { id } });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
