import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
