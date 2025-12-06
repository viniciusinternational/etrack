import { User, Project, MDA } from "./index";

export enum PaymentSourceType {
  project = "project",
  requestForm = "requestForm",
  payroll = "payroll",
}

export enum PaymentStatus {
  draft = "draft",
  pending_approval = "pending_approval",
  approved = "approved",
  processing = "processing",
  paid = "paid",
  failed = "failed",
  cancelled = "cancelled",
  partially_paid = "partially_paid",
}

export enum PaymentMethod {
  bank_transfer = "bank_transfer",
  check = "check",
  cash = "cash",
  mobile_money = "mobile_money",
  card = "card",
}

export interface PaymentItem {
  id: string;
  paymentId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  taxRate: number;
  taxAmount: number;
  total: number;
  requestFormItemId?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentInstallment {
  id: string;
  paymentId: string;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: Date;
  reference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  sourceType: PaymentSourceType;
  projectId?: string;
  project?: Project;
  requestFormId?: string;
  payrollId?: string;
  
  createdById: string;
  createdBy?: User;
  submittedById?: string;
  submittedBy?: User;
  approverIds: string[];
  
  payeeId?: string;
  payerAccountId?: string;
  
  currency: string;
  exchangeRate?: number;
  isForeignCurrency: boolean;
  
  amount: number;
  taxAmount: number;
  totalAmount: number;
  fxAppliedAmount?: number;
  balanceOutstanding: number;
  
  status: PaymentStatus;
  method: PaymentMethod;
  
  paymentDate?: string;
  dueDate?: string;
  scheduledFor?: string;
  
  notes?: string;
  reference?: string;
  tags: string[];
  
  requiresApproval: boolean;
  isDraft: boolean;
  isLocked: boolean;
  isArchived: boolean;
  isRecurring: boolean;
  recurrenceTemplateId?: string;
  
  derivedFromRequestFormItems: boolean;
  requestFormItemIds: string[];
  
  attachments: string[];
  auditLog?: any;
  reconciliationStatus?: string;
  reconciliationDate?: Date;
  ledgerEntryIds: string[];
  cancellationReason?: string;
  
  items: PaymentItem[];
  installments: PaymentInstallment[];

  createdAt: Date;
  updatedAt: Date;
}
