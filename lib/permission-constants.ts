/**
 * Permission Constants for E-Track
 * Defines all modules and actions for the permission system
 */

// All modules in the system
export enum PermissionModule {
  USER = "USER",
  MDA = "MDA",
  PROJECT = "PROJECT",
  MILESTONE = "MILESTONE",
  SUBMISSION = "SUBMISSION",
  BUDGET = "BUDGET",
  EXPENDITURE = "EXPENDITURE",
  REVENUE = "REVENUE",
  PROCUREMENT = "PROCUREMENT",
  TENDER = "TENDER",
  BID = "BID",
  AWARD = "AWARD",
  AUDIT = "AUDIT",
  EVENT = "EVENT",
  MEETING = "MEETING",
  PAYMENT = "PAYMENT",
  DASHBOARD = "DASHBOARD",
  CONTRACT = "CONTRACT",
  AI_ASSISTANT = "AI_ASSISTANT",
}

// All actions available in the system
export enum PermissionAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  EXPORT = "EXPORT",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  UPLOAD = "UPLOAD",
  MANAGE = "MANAGE",
}

// Permission type definition
export interface PermissionDefinition {
  module: PermissionModule;
  action: PermissionAction;
  description: string;
}

// Generate all permission definitions
export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // USER permissions
  { module: PermissionModule.USER, action: PermissionAction.CREATE, description: "Create new users" },
  { module: PermissionModule.USER, action: PermissionAction.READ, description: "View users" },
  { module: PermissionModule.USER, action: PermissionAction.UPDATE, description: "Edit users" },
  { module: PermissionModule.USER, action: PermissionAction.DELETE, description: "Delete users" },
  { module: PermissionModule.USER, action: PermissionAction.EXPORT, description: "Export user data" },

  // MDA permissions
  { module: PermissionModule.MDA, action: PermissionAction.CREATE, description: "Create new MDAs" },
  { module: PermissionModule.MDA, action: PermissionAction.READ, description: "View MDAs" },
  { module: PermissionModule.MDA, action: PermissionAction.UPDATE, description: "Edit MDAs" },
  { module: PermissionModule.MDA, action: PermissionAction.DELETE, description: "Delete MDAs" },
  { module: PermissionModule.MDA, action: PermissionAction.EXPORT, description: "Export MDA data" },

  // PROJECT permissions
  { module: PermissionModule.PROJECT, action: PermissionAction.CREATE, description: "Create new projects" },
  { module: PermissionModule.PROJECT, action: PermissionAction.READ, description: "View projects" },
  { module: PermissionModule.PROJECT, action: PermissionAction.UPDATE, description: "Edit projects" },
  { module: PermissionModule.PROJECT, action: PermissionAction.DELETE, description: "Delete projects" },
  { module: PermissionModule.PROJECT, action: PermissionAction.EXPORT, description: "Export project data" },
  { module: PermissionModule.PROJECT, action: PermissionAction.MANAGE, description: "Manage project lifecycle" },

  // MILESTONE permissions
  { module: PermissionModule.MILESTONE, action: PermissionAction.CREATE, description: "Create milestones" },
  { module: PermissionModule.MILESTONE, action: PermissionAction.READ, description: "View milestones" },
  { module: PermissionModule.MILESTONE, action: PermissionAction.UPDATE, description: "Edit milestones" },
  { module: PermissionModule.MILESTONE, action: PermissionAction.DELETE, description: "Delete milestones" },
  { module: PermissionModule.MILESTONE, action: PermissionAction.APPROVE, description: "Approve milestones" },
  { module: PermissionModule.MILESTONE, action: PermissionAction.REJECT, description: "Reject milestones" },

  // SUBMISSION permissions
  { module: PermissionModule.SUBMISSION, action: PermissionAction.CREATE, description: "Create milestone submissions" },
  { module: PermissionModule.SUBMISSION, action: PermissionAction.READ, description: "View submissions" },
  { module: PermissionModule.SUBMISSION, action: PermissionAction.UPDATE, description: "Edit submissions" },
  { module: PermissionModule.SUBMISSION, action: PermissionAction.DELETE, description: "Delete submissions" },
  { module: PermissionModule.SUBMISSION, action: PermissionAction.APPROVE, description: "Approve submissions" },
  { module: PermissionModule.SUBMISSION, action: PermissionAction.REJECT, description: "Reject submissions" },
  { module: PermissionModule.SUBMISSION, action: PermissionAction.EXPORT, description: "Export submission data" },

  // BUDGET permissions
  { module: PermissionModule.BUDGET, action: PermissionAction.CREATE, description: "Create budget allocations" },
  { module: PermissionModule.BUDGET, action: PermissionAction.READ, description: "View budgets" },
  { module: PermissionModule.BUDGET, action: PermissionAction.UPDATE, description: "Edit budgets" },
  { module: PermissionModule.BUDGET, action: PermissionAction.DELETE, description: "Delete budgets" },
  { module: PermissionModule.BUDGET, action: PermissionAction.UPLOAD, description: "Upload budget files" },
  { module: PermissionModule.BUDGET, action: PermissionAction.EXPORT, description: "Export budget data" },

  // EXPENDITURE permissions
  { module: PermissionModule.EXPENDITURE, action: PermissionAction.CREATE, description: "Create expenditures" },
  { module: PermissionModule.EXPENDITURE, action: PermissionAction.READ, description: "View expenditures" },
  { module: PermissionModule.EXPENDITURE, action: PermissionAction.UPDATE, description: "Edit expenditures" },
  { module: PermissionModule.EXPENDITURE, action: PermissionAction.DELETE, description: "Delete expenditures" },
  { module: PermissionModule.EXPENDITURE, action: PermissionAction.UPLOAD, description: "Upload expenditure files" },
  { module: PermissionModule.EXPENDITURE, action: PermissionAction.EXPORT, description: "Export expenditure data" },

  // REVENUE permissions
  { module: PermissionModule.REVENUE, action: PermissionAction.CREATE, description: "Create revenue records" },
  { module: PermissionModule.REVENUE, action: PermissionAction.READ, description: "View revenues" },
  { module: PermissionModule.REVENUE, action: PermissionAction.UPDATE, description: "Edit revenues" },
  { module: PermissionModule.REVENUE, action: PermissionAction.DELETE, description: "Delete revenues" },
  { module: PermissionModule.REVENUE, action: PermissionAction.UPLOAD, description: "Upload revenue files" },
  { module: PermissionModule.REVENUE, action: PermissionAction.EXPORT, description: "Export revenue data" },

  // PROCUREMENT permissions
  { module: PermissionModule.PROCUREMENT, action: PermissionAction.CREATE, description: "Create procurement requests" },
  { module: PermissionModule.PROCUREMENT, action: PermissionAction.READ, description: "View procurement requests" },
  { module: PermissionModule.PROCUREMENT, action: PermissionAction.UPDATE, description: "Edit procurement requests" },
  { module: PermissionModule.PROCUREMENT, action: PermissionAction.DELETE, description: "Delete procurement requests" },
  { module: PermissionModule.PROCUREMENT, action: PermissionAction.MANAGE, description: "Manage procurement lifecycle" },
  { module: PermissionModule.PROCUREMENT, action: PermissionAction.EXPORT, description: "Export procurement data" },

  // TENDER permissions
  { module: PermissionModule.TENDER, action: PermissionAction.CREATE, description: "Create tenders" },
  { module: PermissionModule.TENDER, action: PermissionAction.READ, description: "View tenders" },
  { module: PermissionModule.TENDER, action: PermissionAction.UPDATE, description: "Edit tenders" },
  { module: PermissionModule.TENDER, action: PermissionAction.DELETE, description: "Delete tenders" },
  { module: PermissionModule.TENDER, action: PermissionAction.MANAGE, description: "Manage tender lifecycle" },
  { module: PermissionModule.TENDER, action: PermissionAction.EXPORT, description: "Export tender data" },

  // BID permissions
  { module: PermissionModule.BID, action: PermissionAction.CREATE, description: "Submit bids" },
  { module: PermissionModule.BID, action: PermissionAction.READ, description: "View bids" },
  { module: PermissionModule.BID, action: PermissionAction.UPDATE, description: "Edit bids" },
  { module: PermissionModule.BID, action: PermissionAction.DELETE, description: "Delete bids" },
  { module: PermissionModule.BID, action: PermissionAction.EXPORT, description: "Export bid data" },

  // AWARD permissions
  { module: PermissionModule.AWARD, action: PermissionAction.CREATE, description: "Create awards" },
  { module: PermissionModule.AWARD, action: PermissionAction.READ, description: "View awards" },
  { module: PermissionModule.AWARD, action: PermissionAction.UPDATE, description: "Edit awards" },
  { module: PermissionModule.AWARD, action: PermissionAction.DELETE, description: "Delete awards" },
  { module: PermissionModule.AWARD, action: PermissionAction.EXPORT, description: "Export award data" },

  // AUDIT permissions
  { module: PermissionModule.AUDIT, action: PermissionAction.READ, description: "View audit logs" },
  { module: PermissionModule.AUDIT, action: PermissionAction.CREATE, description: "Create audit remarks" },
  { module: PermissionModule.AUDIT, action: PermissionAction.UPDATE, description: "Update audit remarks" },
  { module: PermissionModule.AUDIT, action: PermissionAction.DELETE, description: "Delete audit remarks" },
  { module: PermissionModule.AUDIT, action: PermissionAction.EXPORT, description: "Export audit data" },

  // EVENT permissions
  { module: PermissionModule.EVENT, action: PermissionAction.CREATE, description: "Create calendar events" },
  { module: PermissionModule.EVENT, action: PermissionAction.READ, description: "View events" },
  { module: PermissionModule.EVENT, action: PermissionAction.UPDATE, description: "Edit events" },
  { module: PermissionModule.EVENT, action: PermissionAction.DELETE, description: "Delete events" },
  { module: PermissionModule.EVENT, action: PermissionAction.EXPORT, description: "Export event data" },

  // MEETING permissions
  { module: PermissionModule.MEETING, action: PermissionAction.CREATE, description: "Create meetings" },
  { module: PermissionModule.MEETING, action: PermissionAction.READ, description: "View meetings" },
  { module: PermissionModule.MEETING, action: PermissionAction.UPDATE, description: "Edit meetings" },
  { module: PermissionModule.MEETING, action: PermissionAction.DELETE, description: "Delete meetings" },
  { module: PermissionModule.MEETING, action: PermissionAction.MANAGE, description: "Manage meeting schedule" },
  { module: PermissionModule.MEETING, action: PermissionAction.EXPORT, description: "Export meeting data" },

  // PAYMENT permissions
  { module: PermissionModule.PAYMENT, action: PermissionAction.CREATE, description: "Create payments" },
  { module: PermissionModule.PAYMENT, action: PermissionAction.READ, description: "View payments" },
  { module: PermissionModule.PAYMENT, action: PermissionAction.UPDATE, description: "Edit payments" },
  { module: PermissionModule.PAYMENT, action: PermissionAction.DELETE, description: "Delete payments" },
  { module: PermissionModule.PAYMENT, action: PermissionAction.APPROVE, description: "Approve payments" },
  { module: PermissionModule.PAYMENT, action: PermissionAction.REJECT, description: "Reject payments" },
  { module: PermissionModule.PAYMENT, action: PermissionAction.EXPORT, description: "Export payment data" },

  // DASHBOARD permissions
  { module: PermissionModule.DASHBOARD, action: PermissionAction.READ, description: "View dashboard" },
  { module: PermissionModule.DASHBOARD, action: PermissionAction.EXPORT, description: "Export dashboard data" },

  // CONTRACT permissions
  { module: PermissionModule.CONTRACT, action: PermissionAction.CREATE, description: "Create contracts" },
  { module: PermissionModule.CONTRACT, action: PermissionAction.READ, description: "View contracts" },
  { module: PermissionModule.CONTRACT, action: PermissionAction.UPDATE, description: "Edit contracts" },
  { module: PermissionModule.CONTRACT, action: PermissionAction.DELETE, description: "Delete contracts" },
  { module: PermissionModule.CONTRACT, action: PermissionAction.EXPORT, description: "Export contract data" },

  // AI_ASSISTANT permissions
  { module: PermissionModule.AI_ASSISTANT, action: PermissionAction.READ, description: "View and use AI assistant" },
];

// Helper function to get permission key
export function getPermissionKey(module: PermissionModule, action: PermissionAction): string {
  return `${module}_${action}`;
}

// Helper function to parse permission key
export function parsePermissionKey(key: string): { module: PermissionModule; action: PermissionAction } | null {
  const parts = key.split("_");
  if (parts.length < 2) return null;
  
  const action = parts[parts.length - 1] as PermissionAction;
  const module = parts.slice(0, -1).join("_") as PermissionModule;
  
  if (Object.values(PermissionModule).includes(module) && Object.values(PermissionAction).includes(action)) {
    return { module, action };
  }
  
  return null;
}

// Group permissions by module
export function getPermissionsByModule(): Record<PermissionModule, PermissionDefinition[]> {
  const grouped: Record<string, PermissionDefinition[]> = {};
  
  ALL_PERMISSIONS.forEach((perm) => {
    if (!grouped[perm.module]) {
      grouped[perm.module] = [];
    }
    grouped[perm.module].push(perm);
  });
  
  return grouped as Record<PermissionModule, PermissionDefinition[]>;
}

