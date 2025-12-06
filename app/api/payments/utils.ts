import { z } from "zod";
import { paymentStatusValues } from "@/constants/payments";

export const paymentSourceSchema = z.object({
  type: z.enum(["project", "requestForm", "payroll"]),
  projectId: z.string().optional(),
  requestFormId: z.string().optional(),
  payrollId: z.string().optional(),
});

export const paymentItemSchema = z.object({
  description: z.string(),
  quantity: z.number().default(1),
  unitPrice: z.number(),
  currency: z.string(),
  taxRate: z.number().default(0),
  taxAmount: z.number().default(0),
  total: z.number(),
  requestFormItemId: z.string().optional(),
  metadata: z.any().optional(),
});

export const paymentInstallmentSchema = z.object({
  dueDate: z.string(),
  amount: z.number(),
  status: z.enum(paymentStatusValues).default("pending_approval"),
  paidAt: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const paymentWithRelations = {
  include: {
    createdBy: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    },
    submittedBy: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    },
    items: true,
    installments: true,
  },
};

export function serializePayment(payment: Record<string, unknown>) {
  return {
    ...payment,
    amount: Number(payment.amount),
    taxAmount: Number(payment.taxAmount),
    totalAmount: Number(payment.totalAmount),
    balanceOutstanding: Number(payment.balanceOutstanding),
  };
}

export function normalizePaymentItems(
  items: Array<
    Record<string, unknown> & {
      total?: number;
      quantity: number;
      unitPrice: number;
      taxAmount?: number;
      requestFormItemId?: string;
    }
  >,
  currency: string
) {
  const processedItems = items.map((item) => {
    const total =
      item.total ?? item.quantity * item.unitPrice + (item.taxAmount || 0);
    return {
      ...item,
      currency,
      total,
    };
  });

  const totalAmount = processedItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = processedItems.reduce(
    (sum, item) => sum + (item.taxAmount || 0),
    0
  );
  const amount = totalAmount - taxAmount;

  return {
    items: processedItems,
    totals: { amount, taxAmount, totalAmount },
    requestFormItemIds: processedItems
      .map((i) => i.requestFormItemId)
      .filter(Boolean),
  };
}

export function normalizeInstallments(
  installments: Array<{
    dueDate?: string;
    amount?: number;
    status?: string;
    paidAt?: string | Date;
    reference?: string;
    notes?: string;
  }>
) {
  return installments.map((inst) => ({
    dueDate: inst.dueDate,
    amount: inst.amount,
    status: inst.status,
    paidAt: inst.paidAt ? new Date(inst.paidAt) : undefined,
    reference: inst.reference,
    notes: inst.notes,
  }));
}
export async function deriveItemsFromRequestForm(
  requestFormId: string,
  currency: string
) {
  // Placeholder implementation
  return {
    items: [],
    requestFormItemIds: [],
    currency,
  };
}
