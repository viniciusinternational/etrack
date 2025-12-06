/**
 * Authentication utilities for E-Track
 * Role-based authentication and session management
 */

import { User, UserRole, Session } from "@/types";
import { checkUserPermission, getUserPermissions } from "./permissions";
import { PermissionModule, PermissionAction } from "./permission-constants";
// re-export UserRole for convenience in some components that import it from this module
export { UserRole };

// Mock authentication - replace with real auth implementation
export const mockUser: User = {
  id: "1",
  email: "project.manager@etrack.gov",
  name: "Project Manager",
  role: UserRole.Admin,
  mdaId: "mda-1",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockSession: Session = {
  user: mockUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
};

// Role-based permissions
export const ROLE_PERMISSIONS = {
  [UserRole.SuperAdmin]: ["*"], // All permissions
  [UserRole.Admin]: [
    "dashboard.view",
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    "mdas.view",
    "mdas.create",
    "mdas.edit",
    "mdas.delete",
    "system.view",
    "system.manage",
  ],
  [UserRole.GovernorAdmin]: [
    "dashboard.view",
    "reports.view",
    "reports.export",
    "projects.view",
    "finance.view",
    "audit.view",
  ],
  [UserRole.ProjectManager]: [
    "dashboard.view",
    "projects.view",
    "projects.create",
    "projects.edit",
    "submissions.view",
    "submissions.approve",
  ],
  [UserRole.Contractor]: [
    "dashboard.view",
    "projects.view",
    "submissions.create",
    "submissions.view",
  ],
  [UserRole.FinanceOfficer]: [
    "dashboard.view",
    "finance.view",
    "finance.create",
    "finance.edit",
    "budget.upload",
    "expenditure.upload",
    "revenue.upload",
  ],
  [UserRole.ProcurementOfficer]: [
    "dashboard.view",
    "procurement.view",
    "tenders.view",
    "tenders.create",
    "tenders.manage",
    "awards.view",
  ],
  [UserRole.Auditor]: [
    "dashboard.view",
    "audit.view",
    "discrepancies.view",
    "discrepancies.create",
  ],
  [UserRole.MeetingUser]: [
    "dashboard.view",
    "meetings.view",
    "meetings.create",
    "meetings.schedule",
  ],
  [UserRole.Vendor]: ["tenders.view", "bids.create", "awards.view"],
};

/**
 * Check if a user role has a permission (legacy role-based check)
 * @deprecated Use checkUserPermission with userId instead
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.includes("*") || permissions.includes(permission);
}

/**
 * Check if a user has a specific permission (database-based)
 * This is the preferred method for permission checking
 */
export async function hasUserPermission(
  userId: string,
  module: PermissionModule,
  action: PermissionAction
): Promise<boolean> {
  // SuperAdmin role always has all permissions
  // You can check the user's role first if needed
  return await checkUserPermission(userId, module, action);
}

/**
 * Check permission with fallback to role-based (for backward compatibility)
 */
export async function hasPermissionWithFallback(
  userId: string | undefined,
  userRole: UserRole,
  module: PermissionModule,
  action: PermissionAction
): Promise<boolean> {
  // If we have a userId, check database permissions first
  if (userId) {
    const hasDbPermission = await checkUserPermission(userId, module, action);
    if (hasDbPermission) return true;
  }

  // Fallback to role-based permissions
  const permissionKey = `${module}.${action}`;
  return hasPermission(userRole, permissionKey);
}

export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    [UserRole.SuperAdmin]: "Super Administrator",
    [UserRole.Admin]: "System Administrator",
    [UserRole.GovernorAdmin]: "Governor Administrator",
    [UserRole.ProjectManager]: "Project Manager",
    [UserRole.Contractor]: "Contractor",
    [UserRole.FinanceOfficer]: "Finance Officer",
    [UserRole.ProcurementOfficer]: "Procurement Officer",
    [UserRole.Auditor]: "Auditor",
    [UserRole.MeetingUser]: "Meeting User",
    [UserRole.Vendor]: "Vendor",
  };
  return displayNames[role];
}

export function getRoleRoutes(): string[] {
  // Role-aware routing has been normalized to a single dashboard.
  return ["/dashboard"];
}
