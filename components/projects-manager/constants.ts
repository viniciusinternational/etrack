import {
  type Project,
  type MilestoneSubmission,
  ProjectCategory,
  ProjectStatus,
  MilestoneStage,
  SubmissionStatus,
} from "@/types";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "New State Hospital Construction",
    description:
      "Construction of a 200-bed state hospital with modern facilities",
    category: ProjectCategory.Healthcare,
    supervisingMdaId: "mda-2",
    contractorId: "3",
    contractValue: 5000000000,
    startDate: new Date("2024-01-15"),
    endDate: new Date("2025-06-30"),
    status: ProjectStatus.InProgress,
    evidenceDocs: ["doc1.pdf", "doc2.pdf"],
    createdAt: new Date("2024-01-10T08:00:00"),
    updatedAt: new Date("2024-10-15T10:30:00"),
  },
  {
    id: "2",
    title: "Rural Road Rehabilitation Project",
    description:
      "Rehabilitation of 50km rural roads connecting farming communities",
    category: ProjectCategory.Infrastructure,
    supervisingMdaId: "mda-1",
    contractorId: "3",
    contractValue: 2000000000,
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-12-31"),
    status: ProjectStatus.InProgress,
    evidenceDocs: ["contract.pdf"],
    createdAt: new Date("2024-02-20T09:00:00"),
    updatedAt: new Date("2024-10-14T16:45:00"),
  },
];

export const MOCK_MILESTONES: MilestoneSubmission[] = [
  {
    id: "m1",
    projectId: "1",
    contractorId: "3",
    milestoneStage: MilestoneStage.Foundation,
    percentComplete: 80,
    notes: "Foundation work is nearly complete. Some delays due to weather.",
    evidenceDocs: ["foundation-photo1.jpg"],
    status: SubmissionStatus.Approved,
    createdAt: new Date("2024-10-08T10:00:00"),
    updatedAt: new Date("2024-10-10T15:30:00"),
  },
  {
    id: "m2",
    projectId: "1",
    contractorId: "3",
    milestoneStage: MilestoneStage.PreConstruction,
    percentComplete: 100,
    notes: "Site clearing and preparation completed successfully.",
    evidenceDocs: ["site-photo1.jpg"],
    status: SubmissionStatus.Approved,
    createdAt: new Date("2024-09-10T09:00:00"),
    updatedAt: new Date("2024-09-15T12:00:00"),
  },
];

export const MDA_OPTIONS = [
  { id: "mda-1", name: "Ministry of Works" },
  { id: "mda-2", name: "Ministry of Health" },
  { id: "mda-3", name: "Ministry of Education" },
];

export const CONTRACTOR_OPTIONS = [
  { id: "3", name: "Bob Wilson" },
  { id: "6", name: "John Construction Ltd" },
];
