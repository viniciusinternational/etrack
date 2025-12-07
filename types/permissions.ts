/**
 * Permission Type Definitions for E-Track
 * RBAS (Role-Based Access System) permission keys in action_module format
 * 
 * Format: {action}_{module}
 * Example: view_project, create_user, edit_budget
 */

/**
 * Permission key format: {action}_{module}
 * 
 * Actions:
 * - view: Read/access module
 * - create: Create new items
 * - edit: Modify existing items
 * - delete: Remove items
 * - export: Export data
 * - approve: Approve/authorize actions (module-specific)
 * - reject: Reject actions (module-specific)
 * - upload: Upload files
 * - manage: Manage lifecycle
 * 
 * Modules: All modules are singular (project, user, budget, etc.)
 */
export type PermissionKey =
  // Dashboard
  | 'view_dashboard'
  | 'export_dashboard'
  
  // User Module
  | 'create_user'
  | 'view_user'
  | 'edit_user'
  | 'delete_user'
  | 'export_user'
  
  // MDA Module
  | 'create_mda'
  | 'view_mda'
  | 'edit_mda'
  | 'delete_mda'
  | 'export_mda'
  
  // Project Module
  | 'create_project'
  | 'view_project'
  | 'edit_project'
  | 'delete_project'
  | 'export_project'
  | 'manage_project'
  
  // Submission Module
  | 'create_submission'
  | 'view_submission'
  | 'edit_submission'
  | 'delete_submission'
  | 'approve_submission'
  | 'reject_submission'
  | 'export_submission'
  
  // Budget Module
  | 'create_budget'
  | 'view_budget'
  | 'edit_budget'
  | 'delete_budget'
  | 'upload_budget'
  | 'export_budget'
  
  // Expenditure Module
  | 'create_expenditure'
  | 'view_expenditure'
  | 'edit_expenditure'
  | 'delete_expenditure'
  | 'upload_expenditure'
  | 'export_expenditure'
  
  // Revenue Module
  | 'create_revenue'
  | 'view_revenue'
  | 'edit_revenue'
  | 'delete_revenue'
  | 'upload_revenue'
  | 'export_revenue'
  
  // Procurement Module
  | 'create_procurement'
  | 'view_procurement'
  | 'edit_procurement'
  | 'delete_procurement'
  | 'manage_procurement'
  | 'export_procurement'
  
  // Tender Module
  | 'create_tender'
  | 'view_tender'
  | 'edit_tender'
  | 'delete_tender'
  | 'manage_tender'
  | 'export_tender'
  
  // Bid Module
  | 'create_bid'
  | 'view_bid'
  | 'edit_bid'
  | 'delete_bid'
  | 'export_bid'
  
  // Award Module
  | 'create_award'
  | 'view_award'
  | 'edit_award'
  | 'delete_award'
  | 'export_award'
  
  // Audit Module
  | 'view_audit'
  | 'create_audit'
  | 'edit_audit'
  | 'delete_audit'
  | 'export_audit'
  
  // Event Module
  | 'create_event'
  | 'view_event'
  | 'edit_event'
  | 'delete_event'
  | 'export_event'
  
  // Meeting Module
  | 'create_meeting'
  | 'view_meeting'
  | 'edit_meeting'
  | 'delete_meeting'
  | 'manage_meeting'
  | 'export_meeting'
  
  // Payment Module
  | 'create_payment'
  | 'view_payment'
  | 'edit_payment'
  | 'delete_payment'
  | 'approve_payment'
  | 'reject_payment'
  | 'export_payment'
  
  // Contract Module
  | 'create_contract'
  | 'view_contract'
  | 'edit_contract'
  | 'delete_contract'
  | 'export_contract';

/**
 * Permission record type - maps permission keys to boolean values
 */
export type UserPermissions = Record<PermissionKey, boolean>;

/**
 * Partial permissions - for updates (not all permissions required)
 */
export type PartialUserPermissions = Partial<UserPermissions>;

/**
 * All available permission keys as an array
 * Useful for iteration, validation, and UI rendering
 */
export const ALL_PERMISSION_KEYS: PermissionKey[] = [
  // Dashboard
  'view_dashboard',
  'export_dashboard',
  
  // User
  'create_user',
  'view_user',
  'edit_user',
  'delete_user',
  'export_user',
  
  // MDA
  'create_mda',
  'view_mda',
  'edit_mda',
  'delete_mda',
  'export_mda',
  
  // Project
  'create_project',
  'view_project',
  'edit_project',
  'delete_project',
  'export_project',
  'manage_project',
  
  // Submission
  'create_submission',
  'view_submission',
  'edit_submission',
  'delete_submission',
  'approve_submission',
  'reject_submission',
  'export_submission',
  
  // Budget
  'create_budget',
  'view_budget',
  'edit_budget',
  'delete_budget',
  'upload_budget',
  'export_budget',
  
  // Expenditure
  'create_expenditure',
  'view_expenditure',
  'edit_expenditure',
  'delete_expenditure',
  'upload_expenditure',
  'export_expenditure',
  
  // Revenue
  'create_revenue',
  'view_revenue',
  'edit_revenue',
  'delete_revenue',
  'upload_revenue',
  'export_revenue',
  
  // Procurement
  'create_procurement',
  'view_procurement',
  'edit_procurement',
  'delete_procurement',
  'manage_procurement',
  'export_procurement',
  
  // Tender
  'create_tender',
  'view_tender',
  'edit_tender',
  'delete_tender',
  'manage_tender',
  'export_tender',
  
  // Bid
  'create_bid',
  'view_bid',
  'edit_bid',
  'delete_bid',
  'export_bid',
  
  // Award
  'create_award',
  'view_award',
  'edit_award',
  'delete_award',
  'export_award',
  
  // Audit
  'view_audit',
  'create_audit',
  'edit_audit',
  'delete_audit',
  'export_audit',
  
  // Event
  'create_event',
  'view_event',
  'edit_event',
  'delete_event',
  'export_event',
  
  // Meeting
  'create_meeting',
  'view_meeting',
  'edit_meeting',
  'delete_meeting',
  'manage_meeting',
  'export_meeting',
  
  // Payment
  'create_payment',
  'view_payment',
  'edit_payment',
  'delete_payment',
  'approve_payment',
  'reject_payment',
  'export_payment',
  
  // Contract
  'create_contract',
  'view_contract',
  'edit_contract',
  'delete_contract',
  'export_contract',
] as const;

/**
 * Helper function to validate if a string is a valid PermissionKey
 */
export function isValidPermissionKey(key: string): key is PermissionKey {
  return ALL_PERMISSION_KEYS.includes(key as PermissionKey);
}

/**
 * Helper function to get module name from permission key
 * Example: 'view_project' -> 'project'
 */
export function getModuleFromPermissionKey(key: PermissionKey): string {
  const parts = key.split('_');
  return parts.slice(1).join('_');
}

/**
 * Helper function to get action from permission key
 * Example: 'view_project' -> 'view'
 */
export function getActionFromPermissionKey(key: PermissionKey): string {
  return key.split('_')[0];
}

