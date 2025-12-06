import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";

const updateBudgetSchema = z
  .object({
    fiscalYear: z.number().int().min(2000).optional(),
    quarter: z.number().int().min(1).max(4).optional(),
    amount: z.number().positive().optional(),
    source: z.string().min(1).optional(),
    supportingDocs: z.array(z.string()).optional(),
  })
  .passthrough();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const budget = await prisma.budgetAllocation.findUnique({
      where: { id },
      include: { mda: true },
    });

    if (!budget) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: budget });
  } catch (error) {
    console.error("Error fetching budget:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch budget" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log("Budget Update Request Body:", JSON.stringify(body, null, 2));
    const validatedData = updateBudgetSchema.parse(body);

    const existingBudget = await prisma.budgetAllocation.findUnique({
      where: { id },
    });
    if (!existingBudget) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    // Filter out fields that can't be updated directly
    const updateData: Prisma.BudgetAllocationUpdateInput = { ...validatedData };
    const updateDataAny = updateData as Record<string, unknown>;
    delete updateDataAny.mdaId; // mdaId is a relation field, can't be updated directly
    delete updateDataAny.category; // category doesn't exist in BudgetAllocation model
    delete updateDataAny.id; // id can't be updated
    delete updateDataAny.createdAt; // createdAt can't be updated
    delete updateDataAny.updatedAt; // updatedAt is auto-managed

    const updatedBudget = await prisma.budgetAllocation.update({
      where: { id },
      data: updateData,
    });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      // NextRequest.ip is not available, use headers instead
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "UPDATE",
        entityType: "BudgetAllocation",
        entityId: updatedBudget.id,
        description: `Updated budget ${updatedBudget.id}`,
        previousData: existingBudget,
        newData: updatedBudget,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: updatedBudget });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Budget Update Validation Error:", error);
      console.error("Validation Error Details:", error.issues);
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating budget:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update budget" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingBudget = await prisma.budgetAllocation.findUnique({
      where: { id },
    });
    if (!existingBudget) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    await prisma.budgetAllocation.delete({ where: { id } });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      // NextRequest.ip is not available, use headers instead
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "DELETE",
        entityType: "BudgetAllocation",
        entityId: id,
        description: `Deleted budget ${id}`,
        previousData: existingBudget,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: { id } });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete budget" },
      { status: 500 }
    );
  }
}
