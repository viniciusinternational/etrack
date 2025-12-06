import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { requirePermission } from "@/lib/permission-middleware";
import { PermissionModule, PermissionAction } from "@/lib/permission-constants";

const createExpenditureSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().datetime(),
  recipient: z.string().min(1, "Recipient is required"),
  supportingDocs: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await requirePermission(request, PermissionModule.EXPENDITURE, PermissionAction.READ);
    if (!permissionCheck.authorized) return permissionCheck.error!;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const where: Prisma.ExpenditureWhereInput = {};
    if (projectId) where.projectId = projectId;

    const expenditures = await prisma.expenditure.findMany({
      where,
      orderBy: { date: "desc" },
      include: { project: true },
    });

    return NextResponse.json({ ok: true, data: expenditures });
  } catch (error) {
    console.error("Error fetching expenditures:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch expenditures" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await requirePermission(request, PermissionModule.EXPENDITURE, PermissionAction.CREATE);
    if (!permissionCheck.authorized) return permissionCheck.error!;

    const body = await request.json();
    const validatedData = createExpenditureSchema.parse(body);

    const newExpenditure = await prisma.expenditure.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
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
        entityType: "Expenditure",
        entityId: newExpenditure.id,
        description: `Created expenditure of ${newExpenditure.amount} for project ${newExpenditure.projectId}`,
        newData: newExpenditure,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: newExpenditure });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating expenditure:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create expenditure" },
      { status: 500 }
    );
  }
}
