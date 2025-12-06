import type { MilestoneSubmission } from "@/types";
import { MilestoneStage, SubmissionStatus } from "@/types";

export const MILESTONE_STAGES = [
  { value: MilestoneStage.PreConstruction, label: "Pre-Construction" },
  { value: MilestoneStage.Foundation, label: "Foundation" },
  { value: MilestoneStage.Superstructure, label: "Superstructure" },
  { value: MilestoneStage.Finishing, label: "Finishing" },
  {
    value: MilestoneStage.TestingCommissioning,
    label: "Testing & Commissioning",
  },
  { value: MilestoneStage.Handover, label: "Handover" },
];

export const SUBMISSION_STATUSES = [
  {
    value: SubmissionStatus.Pending,
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: SubmissionStatus.Approved,
    label: "Approved",
    color: "bg-green-100 text-green-800",
  },
  {
    value: SubmissionStatus.Rejected,
    label: "Rejected",
    color: "bg-red-100 text-red-800",
  },
];

export const ASSIGNED_PROJECTS = [
  {
    id: "proj-1",
    name: "Infrastructure Development",
    location: "Lagos",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-12-31"),
    budget: 50000000,
  },
  {
    id: "proj-2",
    name: "Healthcare Initiative",
    location: "Abuja",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-11-30"),
    budget: 30000000,
  },
  {
    id: "proj-3",
    name: "Education Program",
    location: "Kano",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-10-31"),
    budget: 20000000,
  },
];

export const MOCK_SUBMISSIONS: MilestoneSubmission[] = [
  {
    id: "sub-1",
    projectId: "proj-1",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    project: { id: "proj-1", title: "Infrastructure Development" } as any,
    contractorId: "cont-1",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contractor: { id: "cont-1", name: "ABC Construction Ltd" } as any,
    milestoneStage: MilestoneStage.Foundation,
    percentComplete: 75,
    notes: "Foundation work completed on schedule",
    evidenceDocs: ["foundation-photo-1.jpg", "foundation-photo-2.jpg"],
    status: SubmissionStatus.Approved,
    reviewedBy: "rev-1",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviewer: { id: "rev-1", name: "John Doe" } as any,
    reviewedAt: new Date("2024-10-20"),
    createdAt: new Date("2024-10-15"),
    updatedAt: new Date("2024-10-20"),
  },
  {
    id: "sub-2",
    projectId: "proj-1",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    project: { id: "proj-1", title: "Infrastructure Development" } as any,
    contractorId: "cont-1",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contractor: { id: "cont-1", name: "ABC Construction Ltd" } as any,
    milestoneStage: MilestoneStage.Superstructure,
    percentComplete: 45,
    notes: "Superstructure work in progress",
    evidenceDocs: ["structure-photo-1.jpg"],
    status: SubmissionStatus.Pending,
    createdAt: new Date("2024-10-22"),
    updatedAt: new Date("2024-10-22"),
  },
  {
    id: "sub-3",
    projectId: "proj-2",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    project: { id: "proj-2", title: "Healthcare Initiative" } as any,
    contractorId: "cont-1",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contractor: { id: "cont-1", name: "ABC Construction Ltd" } as any,
    milestoneStage: MilestoneStage.PreConstruction,
    percentComplete: 100,
    notes: "Site preparation completed",
    evidenceDocs: ["site-prep-1.jpg", "site-prep-2.jpg"],
    status: SubmissionStatus.Approved,
    reviewedBy: "rev-1",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviewer: { id: "rev-1", name: "John Doe" } as any,
    reviewedAt: new Date("2024-10-18"),
    createdAt: new Date("2024-10-10"),
    updatedAt: new Date("2024-10-18"),
  },
];
