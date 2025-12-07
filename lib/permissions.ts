/**
 * Permission utilities for E-Track
 * Centralized permission checking and role-based access control
 * 
 * RBAS: Now includes sync permission checking using JSON field storage
 */

import { UserRole } from '@/types';
import { hasPermission as hasRolePermission, ROLE_PERMISSIONS } from './auth';
import { PermissionModule, PermissionAction, getPermissionKey } from './permission-constants';
import { prisma } from './prisma';
import type { PermissionKey, UserPermissions } from '@/types/permissions';
import type { User } from '@/types';

export interface Permission {
  resource: string;
  action: string;
}

// =====================================================
// LEGACY PERMISSION FUNCTIONS (for backward compatibility)
// =====================================================

// Legacy permission checking (for backward compatibility)
export function checkPermission(userRole: UserRole, permission: Permission): boolean {
  const permissionString = `${permission.resource}.${permission.action}`;
  return hasRolePermission(userRole, permissionString);
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

// =====================================================
// NEW RBAS PERMISSION FUNCTIONS (JSON-based, sync)
// =====================================================

/**
 * Get user's permissions object, defaulting to empty object if not set
 * 
 * @param user - User object or null
 * @returns UserPermissions object
 */
export function getUserPermissions(user: User | null): UserPermissions {
  if (!user || !user.permissions) {
    return {} as UserPermissions;
  }
  
  // Handle both Prisma JsonValue and typed object
  const permissions = user.permissions;
  if (typeof permissions === 'object' && permissions !== null && !Array.isArray(permissions)) {
    return permissions as UserPermissions;
  }
  
  return {} as UserPermissions;
}

/**
 * Check if user has a specific permission
 * 
 * @param user - User object or null
 * @param permission - Permission key to check
 * @returns true if permission exists and is true, false otherwise
 * 
 * @example
 * hasPermission(user, 'view_project')
 */
export function hasPermission(
  user: User | null,
  permission: PermissionKey
): boolean {
  if (!user || !user.permissions) {
    return false;
  }

  const permissions = getUserPermissions(user);
  return permissions[permission] === true;
}

/**
 * Check if user has any of the specified permissions (OR logic)
 * Useful when user needs at least one permission from a set
 * 
 * @param user - User object or null
 * @param permissions - Array of permission keys to check
 * @returns true if user has at least one permission, false otherwise
 * 
 * @example
 * hasAnyPermission(user, ['view_project', 'view_report'])
 */
export function hasAnyPermission(
  user: User | null,
  permissions: PermissionKey[]
): boolean {
  if (!user || !user.permissions || permissions.length === 0) {
    return false;
  }

  const userPermissions = getUserPermissions(user);
  return permissions.some(permission => userPermissions[permission] === true);
}

/**
 * Check if user has all of the specified permissions (AND logic)
 * Useful when user needs multiple permissions simultaneously
 * 
 * @param user - User object or null
 * @param permissions - Array of permission keys to check
 * @returns true if user has all permissions, false otherwise
 * 
 * @example
 * hasAllPermissions(user, ['view_project', 'edit_project'])
 */
export function hasAllPermissions(
  user: User | null,
  permissions: PermissionKey[]
): boolean {
  if (!user || !user.permissions || permissions.length === 0) {
    return false;
  }

  const userPermissions = getUserPermissions(user);
  return permissions.every(permission => userPermissions[permission] === true);
}

/**
 * Check if user can access a module (has view permission for that module)
 * 
 * @param user - User object or null
 * @param module - Module name (e.g., 'project', 'user')
 * @returns true if user has view permission for the module
 * 
 * @example
 * canAccessModule(user, 'project') // Checks for 'view_project'
 */
export function canAccessModule(user: User | null, module: string): boolean {
  const viewPermission = `view_${module}` as PermissionKey;
  return hasPermission(user, viewPermission);
}

/**
 * Get all permissions the user has (returns array of permission keys that are true)
 * 
 * @param user - User object or null
 * @returns Array of permission keys that are granted
 * 
 * @example
 * getUserPermissionsList(user) // ['view_project', 'create_project', ...]
 */
export function getUserPermissionsList(user: User | null): PermissionKey[] {
  if (!user || !user.permissions) {
    return [];
  }

  const permissions = getUserPermissions(user);
  return Object.entries(permissions)
    .filter(([, value]) => value === true)
    .map(([key]) => key as PermissionKey);
}

/**
 * Check if user can perform an action on a module
 * 
 * @param user - User object or null
 * @param module - Module name (e.g., 'project', 'user')
 * @param action - Action to perform ('view' | 'create' | 'edit' | 'delete' | 'approve')
 * @returns true if user has the permission for the action
 * 
 * @example
 * canPerformAction(user, 'project', 'create') // Checks for 'create_project'
 */
export function canPerformAction(
  user: User | null,
  module: string,
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'reject' | 'export' | 'upload' | 'manage'
): boolean {
  const permission = `${action}_${module}` as PermissionKey;
  return hasPermission(user, permission);
}

// =====================================================
// LEGACY DATABASE-BASED PERMISSION FUNCTIONS
// (Kept for migration/backward compatibility)
// =====================================================

/**
 * Check if a user has a specific permission (database-based, async)
 * @deprecated Use hasPermission() with JSON-based permissions instead
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
 * Get all permissions for a user (database-based, async)
 * @deprecated Use getUserPermissions() with JSON-based permissions instead
 */
export async function getUserPermissionsAsync(userId: string): Promise<Array<{ module: string; action: string }>> {
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
 * Get all permission IDs for a user (database-based, async)
 * @deprecated Use getUserPermissionsList() with JSON-based permissions instead
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
 * Check if user has any permission for a module (database-based, async)
 * @deprecated Use canAccessModule() with JSON-based permissions instead
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
