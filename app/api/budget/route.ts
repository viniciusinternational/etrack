import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { requirePermission } from "@/lib/permission-middleware";
import { PermissionModule, PermissionAction } from "@/lib/permission-constants";

const createBudgetSchema = z.object({
  mdaId: z.string().min(1, "MDA ID is required"),
  fiscalYear: z.number().int().min(2000),
  quarter: z.number().int().min(1).max(4),
  amount: z.number().positive("Amount must be positive"),
  source: z.string().min(1, "Source is required"),
  supportingDocs: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await requirePermission(request, PermissionModule.BUDGET, PermissionAction.READ);
    if (!permissionCheck.authorized) {
      return permissionCheck.error!;
    }
    const { searchParams } = new URL(request.url);
    const mdaId = searchParams.get("mdaId");
    const fiscalYear = searchParams.get("fiscalYear");

    const where: Prisma.BudgetAllocationWhereInput = {};
    if (mdaId) where.mdaId = mdaId;
    if (fiscalYear) where.fiscalYear = parseInt(fiscalYear);

    const budgets = await prisma.budgetAllocation.findMany({
      where,
      orderBy: [{ fiscalYear: "desc" }, { quarter: "desc" }],
      include: { mda: true },
    });

    return NextResponse.json({ ok: true, data: budgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await requirePermission(request, PermissionModule.BUDGET, PermissionAction.CREATE);
    if (!permissionCheck.authorized) {
      return permissionCheck.error!;
    }

    const body = await request.json();
    const validatedData = createBudgetSchema.parse(body);

    const newBudget = await prisma.budgetAllocation.create({
      data: validatedData,
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
        entityType: "BudgetAllocation",
        entityId: newBudget.id,
        description: `Created budget allocation of ${newBudget.amount} for MDA ${newBudget.mdaId}`,
        newData: newBudget,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: newBudget });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create budget" },
      { status: 500 }
    );
  }
}
