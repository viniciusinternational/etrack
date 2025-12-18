import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ FIX
) {
  try {
    const authResult = await requireAuth(req, ["view_audit"]);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params; // ✅ FIX

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing audit log ID" },
        { status: 400 }
      );
    }

    const log = await prisma.auditLog.findUnique({
      where: { id },
    });

    if (!log) {
      return NextResponse.json(
        { success: false, error: "Audit log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    console.error("Failed to fetch audit log:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit log" },
      { status: 500 }
    );
  }
}
