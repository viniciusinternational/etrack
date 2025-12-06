import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { MilestoneStage, SubmissionStatus } from "@prisma/client";
import { requirePermission } from "@/lib/permission-middleware";
import { PermissionModule, PermissionAction } from "@/lib/permission-constants";

const createSubmissionSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  contractorId: z.string().min(1, "Contractor ID is required"),
  milestoneStage: z.nativeEnum(MilestoneStage),
  percentComplete: z.number().min(0).max(100),
  notes: z.string().optional(),
  geoTag: z.any().optional(), // Accepting any JSON for now, or specific object
  evidenceDocs: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await requirePermission(request, PermissionModule.SUBMISSION, PermissionAction.READ);
    if (!permissionCheck.authorized) return permissionCheck.error!;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const contractorId = searchParams.get("contractorId");

    const where: Prisma.MilestoneSubmissionWhereInput = {};
    if (projectId) where.projectId = projectId;
    if (contractorId) where.contractorId = contractorId;

    const submissions = await prisma.milestoneSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
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
      },
    });
    return NextResponse.json({ ok: true, data: submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await requirePermission(request, PermissionModule.SUBMISSION, PermissionAction.CREATE);
    if (!permissionCheck.authorized) return permissionCheck.error!;

    const body = await request.json();
    const validatedData = createSubmissionSchema.parse(body);

    const newSubmission = await prisma.milestoneSubmission.create({
      data: {
        ...validatedData,
        status: SubmissionStatus.Pending, // Default status
      },
    });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      // request.ip is optional in NextRequest types depending on version, safe access
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "CREATE",
        entityType: "MilestoneSubmission",
        entityId: newSubmission.id,
        description: `Submitted milestone ${newSubmission.milestoneStage} for project ${newSubmission.projectId}`,
        newData: newSubmission,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: newSubmission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
