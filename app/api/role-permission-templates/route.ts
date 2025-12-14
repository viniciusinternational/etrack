import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-permissions";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const createTemplateSchema = z.object({
  role: z.nativeEnum(UserRole),
  permissions: z.array(z.string()),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ["view_user"]);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (role) {
      // Validate that role is a valid UserRole enum
      const validRoles = Object.values(UserRole);

      if (!validRoles.includes(role as UserRole)) {
        return NextResponse.json(
          {
            ok: false,
            error: `Invalid role: ${role}. Valid roles are: ${validRoles.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }

      // Get template for specific role
      try {
        const template = await prisma.rolePermissionTemplate.findUnique({
          where: { role: role as UserRole },
        });

        // Return empty permissions if no template found
        const response = {
          ok: true,
          data: template || { role, permissions: [] },
        };

        return NextResponse.json(response);
      } catch (dbError) {
        console.error("Database error fetching template:", dbError);
        return NextResponse.json(
          {
            ok: false,
            error: "Failed to fetch template from database",
            details: String(dbError),
          },
          { status: 500 }
        );
      }
    }

    // Get all templates
    const templates = await prisma.rolePermissionTemplate.findMany({
      orderBy: { role: "asc" },
    });
    return NextResponse.json({ ok: true, data: templates });
  } catch (error) {
    console.error("Error fetching role permission templates:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch templates", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ["manage_permissions"]);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validatedData = createTemplateSchema.parse(body);

    const template = await prisma.rolePermissionTemplate.upsert({
      where: { role: validatedData.role },
      update: {
        permissions: validatedData.permissions,
        description: validatedData.description,
      },
      create: validatedData,
    });

    return NextResponse.json({ ok: true, data: template });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating/updating template:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to save template" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ["manage_permissions"]);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (!role) {
      return NextResponse.json(
        { ok: false, error: "Role is required" },
        { status: 400 }
      );
    }

    await prisma.rolePermissionTemplate.delete({
      where: { role: role as UserRole },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
