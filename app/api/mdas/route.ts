import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { requireAuth } from "@/lib/api-permissions";

const createMdaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  headOfMda: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['view_mda']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Prisma.MDAWhereInput = {};
    if (category) where.category = category;

    const mdas = await prisma.mDA.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { supervisedProjects: true, users: true },
        },
      },
    });

    return NextResponse.json({ ok: true, data: mdas });
  } catch (error) {
    console.error("Error fetching MDAs:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch MDAs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['create_mda']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const body = await request.json();
    const validatedData = createMdaSchema.parse(body);

    const newMda = await prisma.mDA.create({
      data: validatedData,
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
        entityType: "MDA",
        entityId: newMda.id,
        description: `Created MDA ${newMda.name}`,
        newData: newMda,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: newMda });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating MDA:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create MDA" },
      { status: 500 }
    );
  }
}
