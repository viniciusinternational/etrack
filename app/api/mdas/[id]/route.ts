import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";

const updateMdaSchema = z
  .object({
    name: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    description: z.string().nullish(),
    headOfMda: z.string().nullish(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().nullish(),
    address: z.string().nullish(),
    isActive: z.boolean().optional(),
  })
  .passthrough();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const mda = await prisma.mDA.findUnique({
      where: { id },
      include: {
        supervisedProjects: true,
        users: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
            status: true,
          },
        },
        budgetAllocations: true,
        revenues: true,
        procurementRequests: true,
      },
    });

    if (!mda) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: mda });
  } catch (error) {
    console.error("Error fetching MDA:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch MDA" },
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
    const validatedData = updateMdaSchema.parse(body);

    const existingMda = await prisma.mDA.findUnique({ where: { id } });
    if (!existingMda) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    const updateData: Prisma.MDAUpdateInput = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.category !== undefined)
      updateData.category = validatedData.category;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.headOfMda !== undefined)
      updateData.headOfMda = validatedData.headOfMda;
    if (validatedData.email !== undefined)
      updateData.email = validatedData.email;
    if (validatedData.phone !== undefined)
      updateData.phone = validatedData.phone;
    if (validatedData.address !== undefined)
      updateData.address = validatedData.address;
    if (validatedData.isActive !== undefined)
      updateData.isActive = validatedData.isActive;

    const updatedMda = await prisma.mDA.update({
      where: { id },
      data: updateData,
    });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "UPDATE",
        entityType: "MDA",
        entityId: updatedMda.id,
        description: `Updated MDA ${updatedMda.name}`,
        previousData: existingMda,
        newData: updatedMda,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: updatedMda });
  } catch (error) {
    console.error("Error updating MDA:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update MDA" },
      { status: 500 }
    );
  }
} // <-- THIS WAS MISSING

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingMda = await prisma.mDA.findUnique({ where: { id } });
    if (!existingMda) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    await prisma.mDA.delete({ where: { id } });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "DELETE",
        entityType: "MDA",
        entityId: id,
        description: `Deleted MDA ${id}`,
        previousData: existingMda,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: { id } });
  } catch (error) {
    console.error("Error deleting MDA:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete MDA" },
      { status: 500 }
    );
  }
}
