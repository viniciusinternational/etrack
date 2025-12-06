import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { BidStatus } from "@prisma/client";

const createBidSchema = z.object({
  procurementRequestId: z.string().min(1, "Procurement Request ID is required"),
  vendorId: z.string().min(1, "Vendor ID is required"),
  bidAmount: z.number().positive("Bid amount must be positive"),
  proposalDocs: z.array(z.string()).min(1, "At least one proposal document is required"),
  complianceDocs: z.array(z.string()).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createBidSchema.parse(body);

    // Check if vendor already submitted a bid for this tender
    const existingBid = await prisma.bid.findFirst({
      where: {
        procurementRequestId: validatedData.procurementRequestId,
        vendorId: validatedData.vendorId,
      },
    });

    if (existingBid) {
      return NextResponse.json(
        { ok: false, message: "Vendor has already submitted a bid for this tender" },
        { status: 400 }
      );
    }

    const newBid = await prisma.bid.create({
      data: {
        ...validatedData,
        status: BidStatus.Submitted,
        submittedAt: new Date(),
      },
    });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "CREATE",
        entityType: "Bid",
        entityId: newBid.id,
        description: `Submitted bid for tender ${validatedData.procurementRequestId}`,
        newData: newBid,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: newBid });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating bid:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create bid" },
      { status: 500 }
    );
  }
}
