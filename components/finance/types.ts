export interface Expenditure {
  id: string;
  projectId: string;
  project?: {
    id: string;
    title: string;
  };
  amount: number;
  date: Date;
  recipient: string;
  supportingDocs: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Revenue {
  id: string;
  mdaId: string;
  mda?: {
    id: string;
    name: string;
    category: string;
  };
  type: string;
  amount: number;
  date: Date;
  supportingDocs: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  mdaId: string;
  mda?: {
    id: string;
    name: string;
    category: string;
  };
  amount: number;
  fiscalYear: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ApprovalStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface FinancialSummary {
  totalBudget: number;
  totalExpenditure: number;
  totalRevenue: number;
  budgetUtilization: number;
  pendingApprovals: number;
}
