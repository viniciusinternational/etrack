// =====================================================
// NOTIFICATIONS
// =====================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// =====================================================
// AUDIT LOGGING
// =====================================================

export enum AuditActionType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  VIEW = "VIEW",
  EXPORT = "EXPORT",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
}

export enum AuditStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  PENDING = "PENDING",
}

export interface AuditLog {
  id: string;
  actor: string;
  entity: string;
  entityId?: string;
  actionType: AuditActionType;
  status: AuditStatus;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  description: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFormInput {
  actor: string;
  entity: string;
  entityId?: string;
  actionType: AuditActionType;
  status: AuditStatus;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  description: string;
}
