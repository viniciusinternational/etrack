import { prisma } from "@/lib/prisma";
import { AuditActionType, AuditStatus } from "@prisma/client";

export function getUserInfoFromHeaders(headersObj: Headers) {
  // In a real app with auth, you'd parse the session token or JWT here.
  // For this migration, we'll try to read x-user-id or fallback.
  const userId = headersObj.get("x-user-id") || undefined;
  // We can't easily get a full user snapshot without a DB call,
  // so we'll return what we can.
  return { userId, userSnapshot: null };
}

export async function createAuditLog(data: {
  userId?: string;
  userSnapshot?: Record<string, unknown> | null;
  actionType: AuditActionType | string;
  entityType: string;
  entityId?: string;
  description: string;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditStatus;
}) {
  try {
    // Map to new AuditLog schema:
    // actor (string), entity (string), entityId (string?), actionType (enum),
    // status (enum), before (Json?), after (Json?), description (string),
    // timestamp (DateTime), ipAddress (string?), userAgent (string?)

    // Determine actor - use userId if available, otherwise "system"
    const actor = data.userId || "system";

    // Convert actionType to enum if it's a string
    let actionTypeEnum: AuditActionType;
    if (typeof data.actionType === "string") {
      // Map common action strings to enum values
      const actionMap: Record<string, AuditActionType> = {
        CREATE: AuditActionType.CREATE,
        UPDATE: AuditActionType.UPDATE,
        DELETE: AuditActionType.DELETE,
        VIEW: AuditActionType.VIEW,
        EXPORT: AuditActionType.EXPORT,
        LOGIN: AuditActionType.LOGIN,
        LOGOUT: AuditActionType.LOGOUT,
      };
      actionTypeEnum = actionMap[data.actionType.toUpperCase()] || AuditActionType.VIEW;
    } else {
      actionTypeEnum = data.actionType;
    }

    // Convert status to enum if it's a string, handling common mistakes
    let statusEnum: AuditStatus;
    if (data.status) {
      if (typeof data.status === "string") {
        const statusUpper = data.status.toUpperCase();
        // Map "FAILURE" to "FAILED" for backward compatibility
        const statusMap: Record<string, AuditStatus> = {
          SUCCESS: AuditStatus.SUCCESS,
          FAILED: AuditStatus.FAILED,
          FAILURE: AuditStatus.FAILED, // Handle common mistake
          PENDING: AuditStatus.PENDING,
        };
        statusEnum = statusMap[statusUpper] || AuditStatus.SUCCESS;
      } else {
        statusEnum = data.status;
      }
    } else {
      statusEnum = AuditStatus.SUCCESS;
    }

    await prisma.auditLog.create({
      data: {
        actor,
        entity: data.entityType,
        entityId: data.entityId ?? null,
        actionType: actionTypeEnum,
        status: statusEnum,
        before: data.previousData ? JSON.parse(JSON.stringify(data.previousData)) : null,
        after: data.newData ? JSON.parse(JSON.stringify(data.newData)) : null,
        description: data.description,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
