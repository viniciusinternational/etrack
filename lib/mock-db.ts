import { 
  User, UserRole, MDA, Project, ProjectStatus, ProjectCategory, 
  MilestoneSubmission, MilestoneStage, SubmissionStatus,
  Expenditure, Revenue, 
  // BudgetAllocation, ProcurementRequest, Bid, Award, Meeting, MeetingMinutes, DiscrepancyRemark, CalendarEvent 
  // Note: Importing types from @/types if they exist, otherwise defining mock shapes matching schema
} from "@/types";

// Mock Data Store

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Ibrahim Musa", email: "ibrahim.musa@example.com", role: UserRole.Admin, mdaId: "m1", mdaName: "Ministry of Works", status: "active", createdAt: new Date(), updatedAt: new Date() },
  { id: "u2", name: "Zainab Abdullahi", email: "zainab.abdullahi@example.com", role: UserRole.ProjectManager, mdaId: "m2", mdaName: "Ministry of Health", status: "active", createdAt: new Date(), updatedAt: new Date() },
  { id: "u3", name: "Abubakar Sadiq", email: "abubakar.sadiq@construction.com", role: UserRole.Contractor, mdaId: "m1", mdaName: "Ministry of Works", status: "active", createdAt: new Date(), updatedAt: new Date() },
  { id: "u4", name: "Fatima Yusuf", email: "fatima.yusuf@finance.gov", role: UserRole.FinanceOfficer, mdaId: "m5", mdaName: "Ministry of Finance", status: "active", createdAt: new Date(), updatedAt: new Date() },
  { id: "u5", name: "Umar Farouk", email: "umar.farouk@audit.gov", role: UserRole.Auditor, mdaId: "m5", mdaName: "Ministry of Finance", status: "active", createdAt: new Date(), updatedAt: new Date() },
];

export const MOCK_MDAS: MDA[] = [
  { id: "m1", name: "Ministry of Works", category: "Infrastructure", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "m2", name: "Ministry of Health", category: "Healthcare", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "m3", name: "Ministry of Education", category: "Education", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "m4", name: "Ministry of Agriculture", category: "Agriculture", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "m5", name: "Ministry of Finance", category: "Finance", isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

export const MOCK_PROJECTS: Project[] = [
  { 
    id: "p1", title: "Kano-Kaduna Road Rehabilitation", description: "Dualization and rehabilitation of the expressway", category: ProjectCategory.Infrastructure, 
    supervisingMdaId: "m1", contractorId: "u3", contractValue: 50000000, startDate: new Date(), endDate: new Date(), 
    status: ProjectStatus.InProgress, evidenceDocs: [], createdAt: new Date(), updatedAt: new Date() 
  },
  { 
    id: "p2", title: "General Hospital Sokoto Renovation", description: "Upgrading of wards and surgical theaters", category: ProjectCategory.Healthcare, 
    supervisingMdaId: "m2", contractorId: "u3", contractValue: 20000000, startDate: new Date(), endDate: new Date(), 
    status: ProjectStatus.Planned, evidenceDocs: [], createdAt: new Date(), updatedAt: new Date() 
  },
  { 
    id: "p3", title: "Model Islamic School Abuja", description: "Construction of new classroom blocks and mosque", category: ProjectCategory.Education, 
    supervisingMdaId: "m3", contractorId: "u3", contractValue: 15000000, startDate: new Date(), endDate: new Date(), 
    status: ProjectStatus.Completed, evidenceDocs: [], createdAt: new Date(), updatedAt: new Date() 
  },
  { 
    id: "p4", title: "Hadejia Irrigation Scheme", description: "Expansion of irrigation canals for dry season farming", category: ProjectCategory.Agriculture, 
    supervisingMdaId: "m4", contractorId: "u3", contractValue: 30000000, startDate: new Date(), endDate: new Date(), 
    status: ProjectStatus.Delayed, evidenceDocs: [], createdAt: new Date(), updatedAt: new Date() 
  },
  { 
    id: "p5", title: "Digital Innovation Hub Katsina", description: "Construction of ICT center for youth empowerment", category: ProjectCategory.Technology, 
    supervisingMdaId: "m1", contractorId: "u3", contractValue: 40000000, startDate: new Date(), endDate: new Date(), 
    status: ProjectStatus.InProgress, evidenceDocs: [], createdAt: new Date(), updatedAt: new Date() 
  },
];

export const MOCK_SUBMISSIONS: MilestoneSubmission[] = [
  {
    id: "s1", projectId: "p1", contractorId: "u3", milestoneStage: MilestoneStage.Foundation, percentComplete: 100,
    status: SubmissionStatus.Approved, evidenceDocs: [], createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "s2", projectId: "p1", contractorId: "u3", milestoneStage: MilestoneStage.Superstructure, percentComplete: 50,
    status: SubmissionStatus.Pending, evidenceDocs: [], createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "s3", projectId: "p2", contractorId: "u3", milestoneStage: MilestoneStage.PreConstruction, percentComplete: 100,
    status: SubmissionStatus.Approved, evidenceDocs: [], createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "s4", projectId: "p5", contractorId: "u3", milestoneStage: MilestoneStage.Foundation, percentComplete: 80,
    status: SubmissionStatus.Pending, evidenceDocs: [], createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "s5", projectId: "p3", contractorId: "u3", milestoneStage: MilestoneStage.Handover, percentComplete: 100,
    status: SubmissionStatus.Approved, evidenceDocs: [], createdAt: new Date(), updatedAt: new Date()
  },
];

export const MOCK_EXPENDITURES: Expenditure[] = [
  { id: "e1", projectId: "p1", amount: 1000000, date: new Date(), recipient: "Alhaji Construction Ltd", supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "e2", projectId: "p1", amount: 500000, date: new Date(), recipient: "Cement Suppliers Nig", supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "e3", projectId: "p2", amount: 2000000, date: new Date(), recipient: "Alhaji Construction Ltd", supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "e4", projectId: "p3", amount: 750000, date: new Date(), recipient: "Consultant Aminu", supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "e5", projectId: "p4", amount: 1200000, date: new Date(), recipient: "Irrigation Experts Ltd", supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
];

export const MOCK_REVENUES: Revenue[] = [
  { id: "r1", mdaId: "m1", type: "Federal Allocation", amount: 100000000, date: new Date(), supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "r2", mdaId: "m2", type: "Donor Grant", amount: 50000000, date: new Date(), supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "r3", mdaId: "m3", type: "Federal Allocation", amount: 80000000, date: new Date(), supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "r4", mdaId: "m4", type: "IGR", amount: 20000000, date: new Date(), supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "r5", mdaId: "m5", type: "Federal Allocation", amount: 150000000, date: new Date(), supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
];

// Mocking types that might be commented out in index.ts but needed
export const MOCK_AWARDS = [
  { id: "a1", procurementRequestId: "pr1", vendorId: "u3", contractValue: 50000000, awardDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
  { id: "a2", procurementRequestId: "pr2", vendorId: "u3", contractValue: 20000000, awardDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
  { id: "a3", procurementRequestId: "pr3", vendorId: "u3", contractValue: 15000000, awardDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
  { id: "a4", procurementRequestId: "pr4", vendorId: "u3", contractValue: 30000000, awardDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
  { id: "a5", procurementRequestId: "pr5", vendorId: "u3", contractValue: 40000000, awardDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
];

export const MOCK_BUDGETS = [
  { id: "b1", mdaId: "m1", fiscalYear: 2024, quarter: 1, amount: 100000000, source: "Federal", supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "b2", mdaId: "m2", fiscalYear: 2024, quarter: 1, amount: 50000000, source: "State", supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "b3", mdaId: "m3", fiscalYear: 2024, quarter: 1, amount: 80000000, source: "Federal", supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "b4", mdaId: "m4", fiscalYear: 2024, quarter: 1, amount: 20000000, source: "Donor", supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "b5", mdaId: "m5", fiscalYear: 2024, quarter: 1, amount: 150000000, source: "Federal", supportingDocs: [], createdAt: new Date(), updatedAt: new Date() },
];

export const MOCK_TENDERS = [
  { id: "t1", mdaId: "m1", title: "Kano-Kaduna Road Tender", description: "Bidding for Road Rehabilitation", estimatedCost: 50000000, requestDate: new Date(), status: "Open", documents: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "t2", mdaId: "m2", title: "Sokoto Hospital Tender", description: "Bidding for Hospital Renovation", estimatedCost: 20000000, requestDate: new Date(), status: "Closed", documents: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "t3", mdaId: "m3", title: "Islamic School Tender", description: "Bidding for School Construction", estimatedCost: 15000000, requestDate: new Date(), status: "Awarded", documents: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "t4", mdaId: "m4", title: "Hadejia Irrigation Tender", description: "Bidding for Irrigation Project", estimatedCost: 30000000, requestDate: new Date(), status: "Bidding", documents: [], createdAt: new Date(), updatedAt: new Date() },
  { id: "t5", mdaId: "m5", title: "Katsina Tech Hub Tender", description: "Bidding for Tech Hub", estimatedCost: 40000000, requestDate: new Date(), status: "Open", documents: [], createdAt: new Date(), updatedAt: new Date() },
];

export const MOCK_EVENTS = [
  { id: "ev1", title: "Project Kickoff - Kano Road", date: new Date(), startTime: "09:00", endTime: "10:00", status: "planned", priority: "high", description: "Kickoff meeting with Alhaji Construction", createdAt: new Date(), updatedAt: new Date() },
  { id: "ev2", title: "Site Inspection - Sokoto", date: new Date(), startTime: "11:00", endTime: "13:00", status: "on-track", priority: "medium", description: "Inspect foundation works", createdAt: new Date(), updatedAt: new Date() },
  { id: "ev3", title: "Budget Review Q1", date: new Date(), startTime: "14:00", endTime: "15:00", status: "completed", priority: "high", description: "Review Q1 budget performance", createdAt: new Date(), updatedAt: new Date() },
  { id: "ev4", title: "Stakeholder Meeting - Abuja", date: new Date(), startTime: "10:00", endTime: "12:00", status: "delayed", priority: "medium", description: "Meet with community leaders", createdAt: new Date(), updatedAt: new Date() },
  { id: "ev5", title: "Audit Report Presentation", date: new Date(), startTime: "09:00", endTime: "17:00", status: "planned", priority: "low", description: "Prepare audit report for Ministry", createdAt: new Date(), updatedAt: new Date() },
];

export const MOCK_STATS = {
  totalUsers: 50,
  totalMDAs: 10,
  activeUsers: 45,
  activeMDAs: 9,
  usersByRole: {
    SuperAdmin: 1,
    Admin: 5,
    GovernorAdmin: 1,
    ProjectManager: 10,
    Contractor: 20,
    FinanceOfficer: 5,
    ProcurementOfficer: 5,
    Vendor: 2,
    Auditor: 1,
    MeetingUser: 0,
  },
  recentUsers: MOCK_USERS,
  recentMDAs: MOCK_MDAS,
};
