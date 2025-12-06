import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { ProjectCategory, ProjectStatus } from "@prisma/client";
import { requirePermission } from "@/lib/permission-middleware";
import { PermissionModule, PermissionAction } from "@/lib/permission-constants";

const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.nativeEnum(ProjectCategory).optional(),
  supervisingMdaId: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  contractorId: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  contractValue: z.number().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  evidenceDocs: z.array(z.string()).optional(),
  plannedMilestones: z.any().optional(), // JSON array of milestone templates
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        supervisingMdaId: true,
        contractorId: true,
        contractValue: true,
        startDate: true,
        endDate: true,
        status: true,
        evidenceDocs: true,
        plannedMilestones: true,
        createdAt: true,
        updatedAt: true,
        supervisingMda: {
          select: {
            id: true,
            name: true,
            category: true,
            isActive: true,
          },
        },
        contractor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
        milestones: true,
        expenditures: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check permission
    const permissionCheck = await requirePermission(request, PermissionModule.PROJECT, PermissionAction.UPDATE);
    if (!permissionCheck.authorized) {
      return permissionCheck.error!;
    }

    const { id } = await params;
    const body = await request.json();
    console.log("Project Update Request Body:", JSON.stringify(body, null, 2));
    const validatedData = updateProjectSchema.parse(body);

    const existingProject = await prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    // Convert date strings to Date objects for Prisma
    const updateData: Prisma.ProjectUpdateInput = { ...validatedData };
    if (updateData.startDate && typeof updateData.startDate === "string") {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate && typeof updateData.endDate === "string") {
      updateData.endDate = new Date(updateData.endDate);
    }
    // Handle plannedMilestones - set to null if empty array, otherwise keep as is
    if (validatedData.plannedMilestones !== undefined) {
      updateData.plannedMilestones = Array.isArray(validatedData.plannedMilestones) && validatedData.plannedMilestones.length === 0
        ? null
        : validatedData.plannedMilestones;
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "UPDATE",
        entityType: "Project",
        entityId: updatedProject.id,
        description: `Updated project ${updatedProject.title}`,
        previousData: existingProject,
        newData: updatedProject,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: updatedProject });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Project Update Validation Error:", error);
      console.error("Validation Error Details:", error.issues);
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating project:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update project" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check permission
    const permissionCheck = await requirePermission(request, PermissionModule.PROJECT, PermissionAction.DELETE);
    if (!permissionCheck.authorized) {
      return permissionCheck.error!;
    }

    const { id } = await params;
    const existingProject = await prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    await prisma.project.delete({ where: { id } });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      // request.ip is optional in NextRequest types depending on version, safe access
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "DELETE",
        entityType: "Project",
        entityId: id,
        description: `Deleted project ${id}`,
        previousData: existingProject,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: { id } });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
