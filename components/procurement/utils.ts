import type { ProcurementStatus, BidStatus } from "./types"
import { PROCUREMENT_STATUSES, BID_STATUSES } from "./constants"

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function getProcurementStatusConfig(status: ProcurementStatus) {
  return PROCUREMENT_STATUSES.find((s) => s.value === status) || PROCUREMENT_STATUSES[0]
}

export function getBidStatusConfig(status: BidStatus) {
  return BID_STATUSES.find((s) => s.value === status) || BID_STATUSES[0]
}

export function getStatusColor(status: ProcurementStatus | BidStatus): string {
  const procStatus = PROCUREMENT_STATUSES.find((s) => s.value === status)
  if (procStatus) return procStatus.color

  const bidStatus = BID_STATUSES.find((s) => s.value === status)
  return bidStatus?.color || "bg-gray-100 text-gray-800"
}
