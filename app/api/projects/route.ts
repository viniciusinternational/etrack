import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { ProjectCategory, ProjectStatus } from "@prisma/client";
import { requireAuth } from "@/lib/api-permissions";

const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.nativeEnum(ProjectCategory),
  supervisingMdaId: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  contractorId: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  supervisorId: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  contractValue: z.number().positive("Contract value must be positive"),
  startDate: z.string(),
  endDate: z.string(),
  evidenceDocs: z.array(z.string()).optional().default([]),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['view_project']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const mdaId = searchParams.get("mdaId");
    const contractorId = searchParams.get("contractorId");

    const where: Prisma.ProjectWhereInput = {};
    if (status) {
      // Validate status is a valid ProjectStatus enum value
      if (Object.values(ProjectStatus).includes(status as ProjectStatus)) {
        where.status = status as ProjectStatus;
      } else {
        return NextResponse.json(
          { ok: false, error: `Invalid status: ${status}. Valid values: ${Object.values(ProjectStatus).join(", ")}` },
          { status: 400 }
        );
      }
    }
    if (category) {
      // Validate category is a valid ProjectCategory enum value
      if (Object.values(ProjectCategory).includes(category as ProjectCategory)) {
        where.category = category as ProjectCategory;
      } else {
        return NextResponse.json(
          { ok: false, error: `Invalid category: ${category}. Valid values: ${Object.values(ProjectCategory).join(", ")}` },
          { status: 400 }
        );
      }
    }
    if (mdaId) where.supervisingMdaId = mdaId;
    if (contractorId) where.contractorId = contractorId;

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
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
            firstname: true,
            lastname: true,
            email: true,
            role: true,
            status: true,
          },
        },
        supervisor: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
            status: true,
          },
        },
        _count: {
          select: { milestones: true, expenditures: true },
        },
      },
    });

    const projectsWithNames = projects.map((project) => ({
      ...project,
      supervisingMdaName: project.supervisingMda?.name,
      contractorName: project.contractor ? `${project.contractor.firstname} ${project.contractor.lastname}` : undefined,
      supervisorName: project.supervisor ? `${project.supervisor.firstname} ${project.supervisor.lastname}` : undefined,
    }));

    return NextResponse.json({ ok: true, data: projectsWithNames });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['create_project']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    console.log(
      "POST /api/projects - Request body:",
      JSON.stringify(body, null, 2)
    );

    const validatedData = createProjectSchema.parse(body);
    console.log("POST /api/projects - Validated:", validatedData);

    // Validate dates
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error("Invalid date format:", {
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
      });
      return NextResponse.json(
        { ok: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (endDate < startDate) {
      console.error("End date before start date:", {
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
      });
      return NextResponse.json(
        {
          ok: false,
          error: `End date (${validatedData.endDate}) must be after start date (${validatedData.startDate})`,
        },
        { status: 400 }
      );
    }

    const newProject = await prisma.project.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        supervisingMdaId: validatedData.supervisingMdaId || undefined,
        contractorId: validatedData.contractorId || undefined,
        supervisorId: validatedData.supervisorId || undefined,
        contractValue: validatedData.contractValue,
        startDate,
        endDate,
        status: ProjectStatus.Planned,
        evidenceDocs: validatedData.evidenceDocs || [],
      },
    });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      // request.ip is optional in NextRequest types depending on version, safe access
      const ip =
        headersList.get("x-forwarded-for") ||
        headersList.get("x-real-ip") ||
        undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "CREATE",
        entityType: "Project",
        entityId: newProject.id,
        description: `Created project ${newProject.title}`,
        newData: newProject,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: newProject });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    console.error("Error creating project:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}
