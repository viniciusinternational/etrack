import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyPassword } from "@/lib/password";
import { createAuditLog } from "@/lib/audit-logger";
import { AuditStatus } from "@prisma/client";
import { randomBytes } from "crypto";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Generate a simple authentication token
 */
function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        role: true,
        mdaId: true,
        status: true,
        password: true,
        mustChangePassword: true,
        permissions: true, // RBAS: Include permissions JSON
      },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== "active") {
      return NextResponse.json(
        { ok: false, error: "Account is inactive. Please contact administrator." },
        { status: 403 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { ok: false, error: "Account not properly configured. Please contact administrator." },
        { status: 403 }
      );
    }

    const isValidPassword = verifyPassword(validatedData.password, user.password);
    if (!isValidPassword) {
      // Create audit log for failed login attempt
      try {
        const headersList = request.headers;
        const ip = headersList.get("x-forwarded-for") ?? undefined;

        await createAuditLog({
          userId: user.id,
          userSnapshot: { email: user.email, name: `${user.firstname} ${user.lastname}` },
          actionType: "LOGIN",
          entityType: "User",
          entityId: user.id,
          description: `Failed login attempt for ${user.email}`,
          status: AuditStatus.FAILED,
          ipAddress: ip,
          userAgent: headersList.get("user-agent") ?? undefined,
        });
      } catch (e) {
        console.error("Audit log failed", e);
      }

      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken();

    // Update lastLogin timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create audit log for successful login
    try {
      const headersList = request.headers;
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: user.id,
        userSnapshot: { email: user.email, name: `${user.firstname} ${user.lastname}`, role: user.role },
        actionType: "LOGIN",
        entityType: "User",
        entityId: user.id,
        description: `Successful login for ${user.email}`,
        newData: { lastLogin: new Date() },
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    // Return user data (without password) and token
    const userData = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      mdaId: user.mdaId,
      mustChangePassword: user.mustChangePassword,
      permissions: user.permissions || null, // RBAS: Include permissions JSON
    };

    return NextResponse.json({
      ok: true,
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error during login:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to process login request" },
      { status: 500 }
    );
  }
}

