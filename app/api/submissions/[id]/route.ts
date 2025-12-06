import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { SubmissionStatus } from "@prisma/client";

const updateSubmissionSchema = z.object({
  percentComplete: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  geoTag: z.any().optional(),
  evidenceDocs: z.array(z.string()).optional(),
  status: z.nativeEnum(SubmissionStatus).optional(),
  reviewedBy: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submission = await prisma.milestoneSubmission.findUnique({
      where: { id },
      include: { project: true, contractor: true, reviewer: true },
    });

    if (!submission) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: submission });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch submission" },
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
    const validatedData = updateSubmissionSchema.parse(body);

    const existingSubmission = await prisma.milestoneSubmission.findUnique({
      where: { id },
    });
    if (!existingSubmission) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    // If status is changing to Approved/Rejected, set reviewedAt
    const extraUpdates: { reviewedAt?: Date } = {};
    if (
      validatedData.status &&
      validatedData.status !== existingSubmission.status
    ) {
      if (
        validatedData.status === SubmissionStatus.Approved ||
        validatedData.status === SubmissionStatus.Rejected
      ) {
        extraUpdates.reviewedAt = new Date();
      }
    }

    const updatedSubmission = await prisma.milestoneSubmission.update({
      where: { id },
      data: { ...validatedData, ...extraUpdates },
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
        entityType: "MilestoneSubmission",
        entityId: updatedSubmission.id,
        description: `Updated submission ${updatedSubmission.id}`,
        previousData: existingSubmission,
        newData: updatedSubmission,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: updatedSubmission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update submission" },
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
    const existingSubmission = await prisma.milestoneSubmission.findUnique({
      where: { id },
    });
    if (!existingSubmission) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    await prisma.milestoneSubmission.delete({ where: { id } });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      // request.ip is optional in NextRequest types depending on version, safe access
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "DELETE",
        entityType: "MilestoneSubmission",
        entityId: id,
        description: `Deleted submission ${id}`,
        previousData: existingSubmission,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: { id } });
  } catch (error) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
