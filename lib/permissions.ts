/**
 * Permission utilities for E-Track
 * RBAS (Role-Based Access System) - JSON-based permission checking
 * 
 * All permission checks use the JSON permissions field on the User model.
 * Format: { [permissionKey]: boolean }
 * Permission keys follow the format: {action}_{module} (e.g., 'view_project', 'create_user')
 */

import type { PermissionKey, UserPermissions } from '@/types/permissions';
import type { User } from '@/types';

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
