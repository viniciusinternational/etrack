import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { requireAuth } from "@/lib/api-permissions";

const createAwardSchema = z.object({
  procurementRequestId: z.string().min(1, "Procurement Request ID is required"),
  vendorId: z.string().min(1, "Vendor ID is required"),
  contractValue: z.number().positive("Contract value must be positive"),
  awardDate: z.string().datetime(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['view_award']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    const where: Prisma.AwardWhereInput = {};
    if (vendorId) where.vendorId = vendorId;

    const awards = await prisma.award.findMany({
      where,
      orderBy: { awardDate: "desc" },
      include: {
        procurementRequest: {
          select: {
            id: true,
            title: true,
            status: true,
            estimatedCost: true,
          },
        },
        vendor: {
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

    return NextResponse.json({ ok: true, data: awards });
  } catch (error) {
    console.error("Error fetching awards:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch awards" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['create_award']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validatedData = createAwardSchema.parse(body);

    const newAward = await prisma.award.create({
      data: {
        ...validatedData,
        awardDate: new Date(validatedData.awardDate),
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
        entityType: "Award",
        entityId: newAward.id,
        description: `Created award for request ${newAward.procurementRequestId}`,
        newData: newAward,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: newAward });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating award:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create award" },
      { status: 500 }
    );
  }
}
