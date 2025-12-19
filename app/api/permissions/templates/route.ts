import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const updateTemplateSchema = z.object({
  role: z.nativeEnum(UserRole),
  permissions: z.record(z.string(), z.boolean()),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const templates = await prisma.rolePermissionTemplate.findMany({
      orderBy: {
        role: "asc",
      },
    });

    return NextResponse.json({
      ok: true,
      data: templates,
      message: "Templates fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching permission templates:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = updateTemplateSchema.parse(body);

    const template = await prisma.rolePermissionTemplate.upsert({
      where: {
        role: validatedData.role,
      },
      update: {
        permissions: validatedData.permissions as any,
        description: validatedData.description,
      },
      create: {
        role: validatedData.role,
        permissions: validatedData.permissions as any,
        description: validatedData.description,
      },
    });

    return NextResponse.json({
      ok: true,
      data: template,
      message: "Template updated successfully",
    });
  } catch (error) {
    console.error("Error updating permission template:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: false, message: "Failed to update template" },
      { status: 500 }
    );
  }
}
