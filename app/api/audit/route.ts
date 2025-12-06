import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permission-middleware";
import { PermissionModule, PermissionAction } from "@/lib/permission-constants";

export async function GET(req: NextRequest) {
  try {
    const permissionCheck = await requirePermission(req, PermissionModule.AUDIT, PermissionAction.READ);
    if (!permissionCheck.authorized) return permissionCheck.error!;
    const { searchParams } = new URL(req.url);
    const entity = searchParams.get("entity");
    const actor = searchParams.get("actor");
    const actionType = searchParams.get("actionType");
    
    const where: Record<string, string> = {};
    if (entity) where.entity = entity;
    if (actor) where.actor = actor;
    if (actionType) where.actionType = actionType;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: 100, // Limit to recent 100 logs
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actor, entity, entityId, actionType, status, before, after, description } = body;

    const log = await prisma.auditLog.create({
      data: {
        actor,
        entity,
        entityId,
        actionType,
        status,
        before: before || null,
        after: after || null,
        description,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
      },
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create audit log" },
      { status: 500 }
    );
  }
}
