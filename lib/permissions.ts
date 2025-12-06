/**
 * Permission utilities for E-Track
 * Centralized permission checking and role-based access control
 */

import { UserRole } from '@/types';
import { hasPermission, ROLE_PERMISSIONS } from './auth';
import { PermissionModule, PermissionAction, getPermissionKey } from './permission-constants';
import { prisma } from './prisma';

export interface Permission {
  resource: string;
  action: string;
}

// Legacy permission checking (for backward compatibility)
export function checkPermission(userRole: UserRole, permission: Permission): boolean {
  const permissionString = `${permission.resource}.${permission.action}`;
  return hasPermission(userRole, permissionString);
}

export function getResourcePermissions(userRole: UserRole, resource: string): string[] {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (permissions.includes('*')) {
    return ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'export'];
  }
  
  return permissions
    .filter(permission => permission.startsWith(`${resource}.`))
    .map(permission => permission.split('.')[1]);
}

// Common permission checks (legacy)
export const PERMISSIONS = {
  DASHBOARD: { resource: 'dashboard', action: 'view' },
  PROJECTS_VIEW: { resource: 'projects', action: 'view' },
  PROJECTS_CREATE: { resource: 'projects', action: 'create' },
  PROJECTS_EDIT: { resource: 'projects', action: 'edit' },
  SUBMISSIONS_VIEW: { resource: 'submissions', action: 'view' },
  SUBMISSIONS_APPROVE: { resource: 'submissions', action: 'approve' },
  FINANCE_VIEW: { resource: 'finance', action: 'view' },
  FINANCE_CREATE: { resource: 'finance', action: 'create' },
  REPORTS_VIEW: { resource: 'reports', action: 'view' },
  REPORTS_EXPORT: { resource: 'reports', action: 'export' },
  AUDIT_VIEW: { resource: 'audit', action: 'view' },
  MEETINGS_VIEW: { resource: 'meetings', action: 'view' },
  MEETINGS_CREATE: { resource: 'meetings', action: 'create' },
} as const;

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const roleRoutes = {
    [UserRole.SuperAdmin]: true, // Can access all routes
    [UserRole.Admin]: route.startsWith('/admin'),
    [UserRole.GovernorAdmin]: route.startsWith('/governor'),
    [UserRole.ProjectManager]: route.startsWith('/project-manager'),
    [UserRole.Contractor]: route.startsWith('/contractor'),
    [UserRole.FinanceOfficer]: route.startsWith('/finance-officer'),
    [UserRole.ProcurementOfficer]: route.startsWith('/procurement-officer'),
    [UserRole.Auditor]: route.startsWith('/auditor'),
    [UserRole.MeetingUser]: route.startsWith('/meeting-user'),
    [UserRole.Vendor]: route.startsWith('/vendor'),
  };
  
  return roleRoutes[userRole] || false;
}

// New database-based permission checking functions
/**
 * Check if a user has a specific permission
 */
export async function checkUserPermission(
  userId: string,
  module: PermissionModule,
  action: PermissionAction
): Promise<boolean> {
  try {
    const permission = await prisma.permission.findUnique({
      where: {
        module_action: {
          module,
          action,
        },
      },
    });

    if (!permission) {
      return false;
    }

    const userPermission = await prisma.userPermission.findUnique({
      where: {
        userId_permissionId: {
          userId,
          permissionId: permission.id,
        },
      },
    });

    return !!userPermission;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<Array<{ module: string; action: string }>> {
  try {
    const userPermissions = await prisma.userPermission.findMany({
      where: { userId },
      include: {
        permission: true,
      },
    });

    return userPermissions.map((up) => ({
      module: up.permission.module,
      action: up.permission.action,
    }));
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Get all permission IDs for a user
 */
export async function getUserPermissionIds(userId: string): Promise<string[]> {
  try {
    const userPermissions = await prisma.userPermission.findMany({
      where: { userId },
      select: { permissionId: true },
    });

    return userPermissions.map((up) => up.permissionId);
  } catch (error) {
    console.error('Error getting user permission IDs:', error);
    return [];
  }
}

/**
 * Check if user has any permission for a module
 */
export async function hasModulePermission(userId: string, module: PermissionModule): Promise<boolean> {
  try {
    const permissions = await prisma.permission.findMany({
      where: { module },
    });

    if (permissions.length === 0) {
      return false;
    }

    const permissionIds = permissions.map((p) => p.id);

    const userPermission = await prisma.userPermission.findFirst({
      where: {
        userId,
        permissionId: { in: permissionIds },
      },
    });

    return !!userPermission;
  } catch (error) {
    console.error('Error checking module permission:', error);
    return false;
  }
}
