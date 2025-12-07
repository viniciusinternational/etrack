import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { requireAuth } from "@/lib/api-permissions";

const createRevenueSchema = z.object({
  mdaId: z.string().min(1, "MDA ID is required"),
  type: z.string().min(1, "Revenue type is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().datetime(),
  supportingDocs: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['view_revenue']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { searchParams } = new URL(request.url);
    const mdaId = searchParams.get("mdaId");

    const where: Prisma.RevenueWhereInput = {};
    if (mdaId) where.mdaId = mdaId;

    const revenues = await prisma.revenue.findMany({
      where,
      orderBy: { date: "desc" },
      include: { mda: true },
    });

    return NextResponse.json({ ok: true, data: revenues });
  } catch (error) {
    console.error("Error fetching revenues:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch revenues" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['create_revenue']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validatedData = createRevenueSchema.parse(body);

    const newRevenue = await prisma.revenue.create({
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
        entityType: "Revenue",
        entityId: newRevenue.id,
        description: `Created revenue of ${newRevenue.amount} for MDA ${newRevenue.mdaId}`,
        newData: newRevenue,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: newRevenue });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating revenue:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create revenue" },
      { status: 500 }
    );
  }
}
