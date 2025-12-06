import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { ProjectCategory, ProjectStatus } from "@prisma/client";

const updateContractSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.nativeEnum(ProjectCategory).optional(),
  supervisingMdaId: z.string().min(1).optional(),
  contractorId: z.string().min(1).optional(),
  contractValue: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  evidenceDocs: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contract = await prisma.project.findUnique({
      where: { id },
      include: {
        supervisingMda: true,
        contractor: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: contract });
  } catch (error) {
    console.error("Error fetching contract:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch contract" },
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
    const validatedData = updateContractSchema.parse(body);

    const existingContract = await prisma.project.findUnique({ where: { id } });
    if (!existingContract) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    const updatedContract = await prisma.project.update({
      where: { id },
      data: {
        ...validatedData,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : undefined,
        endDate: validatedData.endDate
          ? new Date(validatedData.endDate)
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
        entityType: "Project",
        entityId: updatedContract.id,
        description: `Updated contract (project) ${updatedContract.title}`,
        previousData: existingContract,
        newData: updatedContract,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: updatedContract });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating contract:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update contract" },
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
    const existingContract = await prisma.project.findUnique({ where: { id } });
    if (!existingContract) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    await prisma.project.delete({ where: { id } });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      // request.ip is optional in NextRequest types depending on version, safe access
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "DELETE",
        entityType: "Project",
        entityId: id,
        description: `Deleted contract (project) ${id}`,
        previousData: existingContract,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: { id } });
  } catch (error) {
    console.error("Error deleting contract:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete contract" },
      { status: 500 }
    );
  }
}
