import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";

const updateRevenueSchema = z.object({
  type: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.string().datetime().optional(),
  supportingDocs: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const revenue = await prisma.revenue.findUnique({
      where: { id },
      include: { mda: true },
    });

    if (!revenue) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: revenue });
  } catch (error) {
    console.error("Error fetching revenue:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch revenue" },
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
    const validatedData = updateRevenueSchema.parse(body);

    const existingRevenue = await prisma.revenue.findUnique({ where: { id } });
    if (!existingRevenue) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    const updatedRevenue = await prisma.revenue.update({
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
        entityType: "Revenue",
        entityId: updatedRevenue.id,
        description: `Updated revenue ${updatedRevenue.id}`,
        previousData: existingRevenue,
        newData: updatedRevenue,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: updatedRevenue });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating revenue:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update revenue" },
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
    const existingRevenue = await prisma.revenue.findUnique({ where: { id } });
    if (!existingRevenue) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    await prisma.revenue.delete({ where: { id } });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      // request.ip is optional in NextRequest types depending on version, safe access
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "DELETE",
        entityType: "Revenue",
        entityId: id,
        description: `Deleted revenue ${id}`,
        previousData: existingRevenue,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: { id } });
  } catch (error) {
    console.error("Error deleting revenue:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete revenue" },
      { status: 500 }
    );
  }
}
