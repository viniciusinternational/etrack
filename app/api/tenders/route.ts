import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { ProcurementStatus } from "@prisma/client";
import { requireAuth } from "@/lib/api-permissions";

const createTenderSchema = z.object({
  mdaId: z.string().min(1, "MDA ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  estimatedCost: z.number().positive("Estimated cost must be positive"),
  requestDate: z.string().datetime(),
  status: z.nativeEnum(ProcurementStatus).default(ProcurementStatus.Open),
  documents: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['view_tender']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { searchParams } = new URL(request.url);
    const mdaId = searchParams.get("mdaId");

    const where: Prisma.ProcurementRequestWhereInput = {};
    if (mdaId) where.mdaId = mdaId;

    const tenders = await prisma.procurementRequest.findMany({
      where,
      orderBy: { requestDate: "desc" },
      include: { mda: true },
    });

    return NextResponse.json({ ok: true, data: tenders });
  } catch (error) {
    console.error("Error fetching tenders:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch tenders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['create_tender']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validatedData = createTenderSchema.parse(body);

    const newTender = await prisma.procurementRequest.create({
      data: {
        ...validatedData,
        requestDate: new Date(validatedData.requestDate),
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
        entityType: "ProcurementRequest",
        entityId: newTender.id,
        description: `Created tender ${newTender.title}`,
        newData: newTender,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: newTender });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating tender:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create tender" },
      { status: 500 }
    );
  }
}
