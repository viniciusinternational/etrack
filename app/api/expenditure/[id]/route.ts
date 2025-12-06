import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";

const updateExpenditureSchema = z.object({
  amount: z.number().positive().optional(),
  date: z.string().datetime().optional(),
  recipient: z.string().min(1).optional(),
  supportingDocs: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const expenditure = await prisma.expenditure.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!expenditure) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: expenditure });
  } catch (error) {
    console.error("Error fetching expenditure:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch expenditure" },
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
    const validatedData = updateExpenditureSchema.parse(body);

    const existingExpenditure = await prisma.expenditure.findUnique({
      where: { id },
    });
    if (!existingExpenditure) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    const updatedExpenditure = await prisma.expenditure.update({
      where: { id },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
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
        actionType: "UPDATE",
        entityType: "Expenditure",
        entityId: updatedExpenditure.id,
        description: `Updated expenditure ${updatedExpenditure.id}`,
        previousData: existingExpenditure,
        newData: updatedExpenditure,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: updatedExpenditure });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating expenditure:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update expenditure" },
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
    const existingExpenditure = await prisma.expenditure.findUnique({
      where: { id },
    });
    if (!existingExpenditure) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    await prisma.expenditure.delete({ where: { id } });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      // request.ip is optional in NextRequest types depending on version, safe access
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "DELETE",
        entityType: "Expenditure",
        entityId: id,
        description: `Deleted expenditure ${id}`,
        previousData: existingExpenditure,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: { id } });
  } catch (error) {
    console.error("Error deleting expenditure:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete expenditure" },
      { status: 500 }
    );
  }
}
