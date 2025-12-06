export const REVENUE_TYPES = [
  "Tax Revenue",
  "Grant",
  "Loan",
  "Service Fee",
  "Other Income",
];

export const EXPENDITURE_CATEGORIES = [
  "Personnel",
  "Operations",
  "Capital",
  "Maintenance",
  "Other",
];

export const MOCK_BUDGETS = [
  {
    id: "1",
    mdaId: "mda-1",
    mda: { id: "mda-1", name: "Ministry of Finance" },
    amount: 5000000,
    fiscalYear: 2024,
    category: "Operations",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    mdaId: "mda-2",
    mda: { id: "mda-2", name: "Ministry of Health" },
    amount: 3000000,
    fiscalYear: 2024,
    category: "Personnel",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

export const MOCK_EXPENDITURES = [
  {
    id: "exp-1",
    projectId: "proj-1",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    project: { id: "proj-1", title: "Infrastructure Development" } as any,
    amount: 1500000,
    date: new Date("2024-10-15"),
    recipient: "ABC Construction Ltd",
    supportingDocs: ["invoice-001.pdf", "receipt-001.pdf"],
    createdAt: new Date("2024-10-15"),
    updatedAt: new Date("2024-10-15"),
  },
  {
    id: "exp-2",
    projectId: "proj-2",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    project: { id: "proj-2", title: "Healthcare Initiative" } as any,
    amount: 800000,
    date: new Date("2024-10-10"),
    recipient: "Medical Supplies Co",
    supportingDocs: ["invoice-002.pdf"],
    createdAt: new Date("2024-10-10"),
    updatedAt: new Date("2024-10-10"),
  },
];

export const MOCK_REVENUES = [
  {
    id: "rev-1",
    mdaId: "mda-1",
    mda: { id: "mda-1", name: "Ministry of Finance" },
    type: "Tax Revenue",
    amount: 2500000,
    date: new Date("2024-10-20"),
    supportingDocs: ["tax-report-001.pdf"],
    createdAt: new Date("2024-10-20"),
    updatedAt: new Date("2024-10-20"),
  },
  {
    id: "rev-2",
    mdaId: "mda-2",
    mda: { id: "mda-2", name: "Ministry of Health" },
    type: "Grant",
    amount: 1200000,
    date: new Date("2024-10-18"),
    supportingDocs: ["grant-agreement.pdf"],
    createdAt: new Date("2024-10-18"),
    updatedAt: new Date("2024-10-18"),
  },
];

export const PROJECT_OPTIONS = [
  { id: "proj-1", name: "Infrastructure Development" },
  { id: "proj-2", name: "Healthcare Initiative" },
  { id: "proj-3", name: "Education Program" },
  { id: "proj-4", name: "Agricultural Development" },
];

export const MDA_OPTIONS = [
  { id: "mda-1", name: "Ministry of Finance" },
  { id: "mda-2", name: "Ministry of Health" },
  { id: "mda-3", name: "Ministry of Education" },
  { id: "mda-4", name: "Ministry of Agriculture" },
];
