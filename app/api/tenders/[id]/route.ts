import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { ProcurementStatus } from "@prisma/client";

const updateTenderSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  estimatedCost: z.number().positive().optional(),
  requestDate: z.string().datetime().optional(),
  status: z.nativeEnum(ProcurementStatus).optional(),
  documents: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tender = await prisma.procurementRequest.findUnique({
      where: { id },
      include: { 
        mda: true,
        bids: {
          include: {
            vendor: true
          }
        }
      },
    });

    if (!tender) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: tender });
  } catch (error) {
    console.error("Error fetching tender:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch tender" },
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
    const validatedData = updateTenderSchema.parse(body);

    const existingTender = await prisma.procurementRequest.findUnique({
      where: { id },
    });
    if (!existingTender) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    const updatedTender = await prisma.procurementRequest.update({
      where: { id },
      data: {
        ...validatedData,
        requestDate: validatedData.requestDate
          ? new Date(validatedData.requestDate)
          : undefined,
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
        entityType: "ProcurementRequest",
        entityId: updatedTender.id,
        description: `Updated tender ${updatedTender.title}`,
        previousData: existingTender,
        newData: updatedTender,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: updatedTender });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating tender:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update tender" },
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
    const existingTender = await prisma.procurementRequest.findUnique({
      where: { id },
    });
    if (!existingTender) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    await prisma.procurementRequest.delete({ where: { id } });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      // request.ip is optional in NextRequest types depending on version, safe access
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "DELETE",
        entityType: "ProcurementRequest",
        entityId: id,
        description: `Deleted tender ${id}`,
        previousData: existingTender,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: { id } });
  } catch (error) {
    console.error("Error deleting tender:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete tender" },
      { status: 500 }
    );
  }
}
