export const paymentMethodValues = [
  'bank_transfer',
  'check',
  'cash',
  'mobile_money',
  'card',
] as const;

export const paymentStatusValues = [
  'draft',
  'pending_approval',
  'approved',
  'processing',
  'paid',
  'failed',
  'cancelled',
  'partially_paid',
] as const;
