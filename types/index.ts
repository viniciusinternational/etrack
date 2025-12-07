/**
 * E-TRACK TYPES DEFINITIONS
 *
 * Complete TypeScript interfaces for the E-Track government
 * performance and accountability platform
 */

// =====================================================
// USER ROLES & AUTHENTICATION
// =====================================================

export enum UserRole {
  SuperAdmin = "SuperAdmin",
  Admin = "Admin",
  GovernorAdmin = "GovernorAdmin",
  ProjectManager = "ProjectManager",
  Contractor = "Contractor",
  FinanceOfficer = "FinanceOfficer",
  ProcurementOfficer = "ProcurementOfficer",
  Vendor = "Vendor",
  Auditor = "Auditor",
  MeetingUser = "MeetingUser",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  mdaId?: string;
  mdaName?: string;
  status: "active" | "inactive";
  lastLogin?: Date;
  permissions?: import('./permissions').UserPermissions; // RBAS: JSON permissions in action_module format
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  expires: string;
}

// =====================================================
// MDA (MINISTRIES, DEPARTMENTS & AGENCIES)
// =====================================================

export interface MDA {
  id: string;
  name: string;
  category: string;
  description?: string;
  headOfMda?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// PROJECTS
// =====================================================

export enum ProjectStatus {
  Planned = "Planned",
  InProgress = "InProgress",
  Delayed = "Delayed",
  Completed = "Completed",
}

export enum ProjectCategory {
  Infrastructure = "Infrastructure",
  Healthcare = "Healthcare",
  Education = "Education",
  Agriculture = "Agriculture",
  Technology = "Technology",
  Environment = "Environment",
  Housing = "Housing",
}

export interface ProjectMilestoneTemplate {
  stage: MilestoneStage;
  targetDate?: string;
  description?: string;
  targetPercent?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  supervisingMdaId: string;
  supervisingMda?: MDA;
  contractorId: string;
  contractor?: User;
  contractValue: number;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  evidenceDocs: string[];
  plannedMilestones?: ProjectMilestoneTemplate[];
  milestones?: MilestoneSubmission[];
  expenditures?: Expenditure[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectFormInput = {
  title: string;
  description: string;
  category: ProjectCategory;
  supervisingMdaId: string;
  contractorId: string;
  contractValue: number;
  startDate: string; // string from input
  endDate: string; // string from input
  evidenceDocs: string[];
  plannedMilestones?: ProjectMilestoneTemplate[];
};

// =====================================================
// MILESTONES
// =====================================================

export enum MilestoneStage {
  PreConstruction = "PreConstruction",
  Foundation = "Foundation",
  Superstructure = "Superstructure",
  Finishing = "Finishing",
  TestingCommissioning = "TestingCommissioning",
  Handover = "Handover",
}

export enum SubmissionStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface MilestoneSubmission {
  id: string;
  projectId: string;
  project?: Project;
  contractorId: string;
  contractor?: User;
  milestoneStage: MilestoneStage;
  percentComplete: number;
  notes?: string;
  geoTag?: GeoLocation;
  evidenceDocs: string[];
  status: SubmissionStatus;
  reviewedBy?: string;
  reviewer?: User;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MilestoneSubmissionFormInput = {
  projectId: string;
  contractorId: string;

  milestoneStage: MilestoneStage;
  percentComplete: number;
  notes?: string;

  geoTag?: GeoLocation;
  evidenceDocs: string[];

  status: SubmissionStatus;

  // timestamps (strings because form handles JSON)
  createdAt: string;
  updatedAt: string;
};

export type BudgetFormInput = {
  mdaId: string;
  amount: number;
  fiscalYear: number;
  quarter: number;
  source: string;
};


// =====================================================
// FINANCE
// =====================================================

//   export interface BudgetAllocation {
//     id: string;
//     mdaId: string;
//     mda?: MDA;
//     fiscalYear: number;
//     quarter: 1 | 2 | 3 | 4;
//     amount: number;
//     source: string;
//     supportingDocs: string[];
//     createdAt: Date;
//     updatedAt: Date;
//   }

export type ExpenditureFormInput = {
  projectId: string;
  amount: number;
  date: string; // string from input
  recipient: string;
  supportingDocs: string[];
};


export interface Expenditure {
  id: string;
  projectId: string;
  project?: Project;
  amount: number;
  date: Date;
  recipient: string;
  supportingDocs: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type RevenueFormInput = {
  mdaId: string;
  type: string;
  amount: number;
  date: string; // string from input
  supportingDocs: string[];
};

export interface Revenue {
  id: string;
  mdaId: string;
  mda?: MDA;
  type: string;
  amount: number;
  date: Date;
  supportingDocs: string[];
  createdAt: Date;
  updatedAt: Date;
}

  // =====================================================
  // PROCUREMENT
  // =====================================================

  export enum ProcurementStatus {
    Open = 'Open',
    Bidding = 'Bidding',
    Awarded = 'Awarded',
    Closed = 'Closed',
  }

  export enum BidStatus {
    Submitted = 'Submitted',
    Rejected = 'Rejected',
    Awarded = 'Awarded',
  }

  export interface ProcurementRequest {
    id: string;
    mdaId: string;
    mda?: MDA;
    title: string;
    description: string;
    estimatedCost: number;
    requestDate: Date;
    status: ProcurementStatus;
    documents: string[];
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Bid {
    id: string;
    procurementRequestId: string;
    procurementRequest?: ProcurementRequest;
    vendorId: string;
    vendor?: User;
    bidAmount: number;
    proposalDocs: string[];
    complianceDocs: string[];
    status: BidStatus;
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Award {
    id: string;
    procurementRequestId: string;
    procurementRequest?: ProcurementRequest;
    vendorId: string;
    vendor?: User;
    contractValue: number;
    awardDate: Date;
    createdAt: Date;
    updatedAt: Date;
  }

// =====================================================
// MEETINGS
// =====================================================

//   export interface Meeting {
//     id: string;
//     title: string;
//     agendaDocs: string[];
//     participants: string[];
//     participantUsers?: User[];
//     scheduledAt: Date;
//     locationOrLink: string;
//     createdAt: Date;
//     updatedAt: Date;
//   }

//   export interface ActionItem {
//     task: string;
//     responsibleUserId?: string;
//     responsibleUser?: User;
//     dueDate?: Date;
//   }

//   export interface MeetingMinutes {
//     id: string;
//     meetingId: string;
//     meeting?: Meeting;
//     decisions: string[];
//     actionItems: ActionItem[];
//     attachments: string[];
//     recordedAt: Date;
//     createdAt: Date;
//     updatedAt: Date;
//   }

// =====================================================
// AUDIT & DISCREPANCIES
// =====================================================

//   export enum AuditModule {
//     Budget = 'budget',
//     Expenditure = 'expenditure',
//     Revenue = 'revenue',
//     Procurement = 'procurement',
//     Project = 'project',
//   }

//   export enum DiscrepancyStatus {
//     Open = 'Open',
//     Resolved = 'Resolved',
//     Escalated = 'Escalated',
//   }

//   export interface DiscrepancyRemark {
//     id: string;
//     entityId: string; // references any document id
//     module: AuditModule;
//     auditorId: string;
//     auditor?: User;
//     comment: string;
//     status: DiscrepancyStatus;
//     resolvedAt?: Date;
//     createdAt: Date;
//     updatedAt: Date;
//   }

// =====================================================
// API RESPONSES
// =====================================================

// =====================================================
// CALENDAR / EVENTS
// A shared event type used by the global calendar component and
// any dashboard pages that display scheduled items.
// =====================================================

export type EventStatus = "on-track" | "delayed" | "completed" | "planned";
export type EventPriority = "high" | "medium" | "low";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date; // event date (a Date object)
  startTime?: string; // optional HH:MM
  endTime?: string; // optional HH:MM
  project?: string; // optional project or group associated
  status?: EventStatus;
  priority?: EventPriority;
  description?: string;
  contractor?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T = Record<string, unknown>> {
  ok: boolean;
  data?: T;
  message: string;
}

export interface PaginatedResponse<T = Record<string, unknown>> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// =====================================================
// FORM TYPES
// =====================================================

export interface ProjectFormData {
  title: string;
  description: string;
  category: ProjectCategory;
  supervisingMdaId: string;
  contractorId: string;
  contractValue: number;
  startDate: string;
  endDate: string;
  evidenceDocs?: string[];
}

export interface MilestoneFormData {
  milestoneStage: MilestoneStage;
  percentComplete: number;
  notes?: string;
  geoTag?: { lat: number; lng: number };
  evidenceDocs: string[];
}

// =====================================================
// FILE UPLOAD
// =====================================================

// =====================================================
// ADMIN MANAGEMENT TYPES
// =====================================================

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  mdaId?: string;
  password?: string;
  status: "active" | "inactive";
}

export interface MDAFormData {
  name: string;
  category: string;
  description?: string;
  headOfMda?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalMDAs: number;
  activeUsers: number;
  activeMDAs: number;
  usersByRole: Record<UserRole, number>;
  recentUsers: User[];
  recentMDAs: MDA[];
}

// =====================================================
// NOTIFICATIONS
// =====================================================

// =====================================================
// AUDIT LOGGING
// =====================================================
export * from "./audit";
