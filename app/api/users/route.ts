import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { UserRole } from "@prisma/client";
import { hashPassword, generatePassword } from "@/lib/password";
import { checkUserPermission } from "@/lib/permissions";
import { PermissionModule, PermissionAction } from "@/lib/permission-constants";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.nativeEnum(UserRole),
  mdaId: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  password: z.string().optional(),
  status: z.string().optional().default("active"),
  permissionIds: z.array(z.string()).optional(),
  generatePassword: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mdaId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        mda: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });
    const usersWithMdaName = users.map((user) => ({
      ...user,
      mdaName: user.mda?.name,
      status: user.status,
    }));
    return NextResponse.json({ ok: true, data: usersWithMdaName });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getUserInfoFromHeaders(request.headers);
    
    // Check if user has permission to create users
    const hasPermission = await checkUserPermission(userId, PermissionModule.USER, PermissionAction.CREATE);
    if (!hasPermission) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { ok: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    // Handle password generation
    let passwordHash: string | undefined;
    let mustChangePassword = false;
    
    if (validatedData.generatePassword) {
      const generatedPassword = generatePassword();
      passwordHash = hashPassword(generatedPassword);
      mustChangePassword = true;
    } else if (validatedData.password) {
      passwordHash = hashPassword(validatedData.password);
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        mdaId: validatedData.mdaId,
        status: validatedData.status,
        password: passwordHash,
        mustChangePassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mdaId: true,
        status: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Assign permissions if provided
    if (validatedData.permissionIds && validatedData.permissionIds.length > 0) {
      // Verify all permission IDs exist
      const permissions = await prisma.permission.findMany({
        where: {
          id: { in: validatedData.permissionIds },
        },
      });

      if (permissions.length > 0) {
        await prisma.userPermission.createMany({
          data: permissions.map((p) => ({
            userId: newUser.id,
            permissionId: p.id,
          })),
          skipDuplicates: true,
        });
      }
    }

    try {
      const headersList = request.headers;
      const { userSnapshot } = getUserInfoFromHeaders(headersList);
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "CREATE",
        entityType: "User",
        entityId: newUser.id,
        description: `Created user ${newUser.email}`,
        newData: newUser,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ 
      ok: true, 
      data: newUser,
      generatedPassword: validatedData.generatePassword ? generatePassword() : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    console.error("Error creating user:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
