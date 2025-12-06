import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { BidStatus, ProcurementStatus } from "@prisma/client";

const updateBidSchema = z.object({
  status: z.nativeEnum(BidStatus),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = updateBidSchema.parse(body);

    const existingBid = await prisma.bid.findUnique({
      where: { id },
      include: { procurementRequest: true },
    });

    if (!existingBid) {
      return NextResponse.json(
        { ok: false, message: "Bid not found" },
        { status: 404 }
      );
    }

    let result;

    if (status === BidStatus.Awarded) {
      // Transaction for awarding:
      // 1. Update Bid to Awarded
      // 2. Create Award record
      // 3. Update Tender to Awarded
      // 4. (Optional) Reject other bids - skipping for now to keep it simple/flexible
      
      result = await prisma.$transaction(async (tx) => {
        const updatedBid = await tx.bid.update({
          where: { id },
          data: { status: BidStatus.Awarded },
        });

        const award = await tx.award.create({
          data: {
            procurementRequestId: existingBid.procurementRequestId,
            vendorId: existingBid.vendorId,
            contractValue: existingBid.bidAmount,
            awardDate: new Date(),
          },
        });

        await tx.procurementRequest.update({
          where: { id: existingBid.procurementRequestId },
          data: { status: ProcurementStatus.Awarded },
        });

        return { bid: updatedBid, award };
      });
    } else {
      // Simple status update (e.g. Rejected)
      result = await prisma.bid.update({
        where: { id },
        data: { status },
      });
    }

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "UPDATE",
        entityType: "Bid",
        entityId: id,
        description: `Updated bid status to ${status}`,
        previousData: existingBid,
        newData: result,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating bid:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update bid" },
      { status: 500 }
    );
  }
}
