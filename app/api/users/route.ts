import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { UserRole } from "@prisma/client";
import { hashPassword, generatePassword } from "@/lib/password";
import { requireAuth } from "@/lib/api-permissions";

const createUserSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  role: z.nativeEnum(UserRole),
  mdaId: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  password: z.string().optional(),
  status: z.string().optional().default("active"),
  generatePassword: z.boolean().optional().default(false),
  mustChangePassword: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['view_user']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstname: true,
        lastname: true,
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
    // Check authentication and permission
    const authResult = await requireAuth(request, ['create_user']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

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
    let mustChangePassword = validatedData.mustChangePassword;
    let finalGeneratedPassword: string | undefined;
    
    if (validatedData.generatePassword) {
      finalGeneratedPassword = generatePassword();
      passwordHash = hashPassword(finalGeneratedPassword);
      mustChangePassword = true;
    } else if (validatedData.password) {
      passwordHash = hashPassword(validatedData.password);
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        firstname: validatedData.firstname,
        lastname: validatedData.lastname,
        email: validatedData.email,
        role: validatedData.role,
        mdaId: validatedData.mdaId,
        status: validatedData.status,
        password: passwordHash,
        mustChangePassword,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        role: true,
        mdaId: true,
        status: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Assign permissions if provided - REMOVED because Permission model does not exist
    // Permissions are handled via JSON field on User model and separate update call
    
    try {
      const headersList = request.headers;
      const { userSnapshot, userId } = getUserInfoFromHeaders(headersList);
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: user.id,
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
      generatedPassword: finalGeneratedPassword,
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
