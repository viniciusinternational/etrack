import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { ProjectCategory, ProjectStatus } from "@prisma/client";
import { requireAuth } from "@/lib/api-permissions";

// Reusing Project schema as Contract seems to be a view of Project
const createContractSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.nativeEnum(ProjectCategory),
  supervisingMdaId: z.string().min(1, "Supervising MDA ID is required"),
  contractorId: z.string().min(1, "Contractor ID is required"),
  contractValue: z.number().positive("Contract value must be positive"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.Planned),
  evidenceDocs: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['view_contract']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { searchParams } = new URL(request.url);
    const contractorId = searchParams.get("contractorId");

    const where: Prisma.ProjectWhereInput = {};
    if (contractorId) where.contractorId = contractorId;

    const contracts = await prisma.project.findMany({
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
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, data: contracts });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['create_contract']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validatedData = createContractSchema.parse(body);

    const newContract = await prisma.project.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
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
        entityType: "Project", // Contract is Project
        entityId: newContract.id,
        description: `Created contract (project) ${newContract.title}`,
        newData: newContract,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: newContract });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create contract" },
      { status: 500 }
    );
  }
}
