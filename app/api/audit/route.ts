import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-permissions";
import { AuditActionType, AuditStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(req, ['view_audit']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
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

    // Convert actionType to enum if it's a string
    let actionTypeEnum: AuditActionType;
    if (typeof actionType === "string") {
      const actionMap: Record<string, AuditActionType> = {
        CREATE: AuditActionType.CREATE,
        UPDATE: AuditActionType.UPDATE,
        DELETE: AuditActionType.DELETE,
        VIEW: AuditActionType.VIEW,
        EXPORT: AuditActionType.EXPORT,
        LOGIN: AuditActionType.LOGIN,
        LOGOUT: AuditActionType.LOGOUT,
      };
      actionTypeEnum = actionMap[actionType.toUpperCase()] || AuditActionType.VIEW;
    } else {
      actionTypeEnum = actionType;
    }

    // Convert status to enum if it's a string, handling common mistakes
    let statusEnum: AuditStatus;
    if (typeof status === "string") {
      const statusUpper = status.toUpperCase();
      // Map "FAILURE" to "FAILED" for backward compatibility
      const statusMap: Record<string, AuditStatus> = {
        SUCCESS: AuditStatus.SUCCESS,
        FAILED: AuditStatus.FAILED,
        FAILURE: AuditStatus.FAILED, // Handle common mistake
        PENDING: AuditStatus.PENDING,
      };
      statusEnum = statusMap[statusUpper] || AuditStatus.SUCCESS;
    } else {
      statusEnum = status;
    }

    const log = await prisma.auditLog.create({
      data: {
        actor,
        entity,
        entityId,
        actionType: actionTypeEnum,
        status: statusEnum,
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
