import axios from "axios";
import { AuditActionType, AuditStatus } from "@/types";

export async function createAuditLog({
  actor,
  entity,
  entityId,
  actionType,
  status,
  before,
  after,
  description,
}: {
  actor: string;
  entity: string;
  entityId?: string;
  actionType: AuditActionType;
  status: AuditStatus;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  description: string;
}) {
  try {
    await axios.post("/api/audit", {
      actor,
      entity,
      entityId,
      actionType,
      status,
      before,
      after,
      description,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging should not break the main flow
  }
}
