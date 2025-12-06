import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";

const updateAwardSchema = z.object({
  contractValue: z.number().positive().optional(),
  awardDate: z.string().datetime().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const award = await prisma.award.findUnique({
      where: { id },
      include: {
        procurementRequest: true,
        vendor: true,
      },
    });

    if (!award) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: award });
  } catch (error) {
    console.error("Error fetching award:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch award" },
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
    const validatedData = updateAwardSchema.parse(body);

    const existingAward = await prisma.award.findUnique({ where: { id } });
    if (!existingAward) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    const updatedAward = await prisma.award.update({
      where: { id },
      data: {
        ...validatedData,
        awardDate: validatedData.awardDate
          ? new Date(validatedData.awardDate)
          : undefined,
      },
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
        entityType: "Award",
        entityId: updatedAward.id,
        description: `Updated award ${updatedAward.id}`,
        previousData: existingAward,
        newData: updatedAward,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: updatedAward });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating award:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update award" },
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
    const existingAward = await prisma.award.findUnique({ where: { id } });
    if (!existingAward) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    await prisma.award.delete({ where: { id } });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      // NextRequest.ip is not available, use headers instead
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "DELETE",
        entityType: "Award",
        entityId: id,
        description: `Deleted award ${id}`,
        previousData: existingAward,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: { id } });
  } catch (error) {
    console.error("Error deleting award:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete award" },
      { status: 500 }
    );
  }
}
