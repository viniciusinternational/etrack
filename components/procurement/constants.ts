import type { ProcurementRequest, Bid, Award } from "./types"
import { ProcurementStatus, BidStatus } from "./types"

export const PROCUREMENT_STATUSES = [
  { value: ProcurementStatus.Open, label: "Open", color: "bg-blue-100 text-blue-800" },
  { value: ProcurementStatus.Bidding, label: "Bidding", color: "bg-yellow-100 text-yellow-800" },
  { value: ProcurementStatus.Awarded, label: "Awarded", color: "bg-green-100 text-green-800" },
  { value: ProcurementStatus.Closed, label: "Closed", color: "bg-gray-100 text-gray-800" },
]

export const BID_STATUSES = [
  { value: BidStatus.Submitted, label: "Submitted", color: "bg-blue-100 text-blue-800" },
  { value: BidStatus.Rejected, label: "Rejected", color: "bg-red-100 text-red-800" },
  { value: BidStatus.Awarded, label: "Awarded", color: "bg-green-100 text-green-800" },
]

export const MDA_OPTIONS = [
  { id: "mda-1", name: "Ministry of Finance" },
  { id: "mda-2", name: "Ministry of Health" },
  { id: "mda-3", name: "Ministry of Education" },
  { id: "mda-4", name: "Ministry of Agriculture" },
]

export const VENDOR_OPTIONS = [
  { id: "vendor-1", name: "ABC Supplies Ltd", email: "contact@abcsupplies.com" },
  { id: "vendor-2", name: "XYZ Construction Co", email: "info@xyzcon.com" },
  { id: "vendor-3", name: "Global Services Inc", email: "sales@globalservices.com" },
  { id: "vendor-4", name: "Tech Solutions Ltd", email: "support@techsolutions.com" },
]

export const MOCK_PROCUREMENT_REQUESTS: ProcurementRequest[] = [
  {
    id: "proc-1",
    mdaId: "mda-1",
    mda: { id: "mda-1", name: "Ministry of Finance" },
    title: "Office Equipment Procurement",
    description: "Procurement of computers, printers, and office furniture",
    estimatedCost: 500000,
    requestDate: new Date("2024-10-01"),
    status: ProcurementStatus.Bidding,
    documents: ["requirements.pdf", "specifications.pdf"],
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-15"),
  },
  {
    id: "proc-2",
    mdaId: "mda-2",
    mda: { id: "mda-2", name: "Ministry of Health" },
    title: "Medical Supplies Tender",
    description: "Supply of medical equipment and consumables for hospitals",
    estimatedCost: 2000000,
    requestDate: new Date("2024-09-15"),
    status: ProcurementStatus.Awarded,
    documents: ["tender-doc.pdf"],
    createdAt: new Date("2024-09-15"),
    updatedAt: new Date("2024-10-10"),
  },
  {
    id: "proc-3",
    mdaId: "mda-3",
    mda: { id: "mda-3", name: "Ministry of Education" },
    title: "School Infrastructure Development",
    description: "Construction and renovation of school buildings",
    estimatedCost: 5000000,
    requestDate: new Date("2024-10-05"),
    status: ProcurementStatus.Open,
    documents: ["project-plan.pdf", "budget.pdf"],
    createdAt: new Date("2024-10-05"),
    updatedAt: new Date("2024-10-05"),
  },
]

export const MOCK_BIDS: Bid[] = [
  {
    id: "bid-1",
    procurementRequestId: "proc-1",
    procurementRequest: MOCK_PROCUREMENT_REQUESTS[0],
    vendorId: "vendor-1",
    vendor: { id: "vendor-1", name: "ABC Supplies Ltd", email: "contact@abcsupplies.com" },
    bidAmount: 480000,
    proposalDocs: ["proposal-1.pdf"],
    complianceDocs: ["compliance-1.pdf"],
    status: BidStatus.Submitted,
    submittedAt: new Date("2024-10-10"),
    createdAt: new Date("2024-10-10"),
    updatedAt: new Date("2024-10-10"),
  },
  {
    id: "bid-2",
    procurementRequestId: "proc-1",
    procurementRequest: MOCK_PROCUREMENT_REQUESTS[0],
    vendorId: "vendor-2",
    vendor: { id: "vendor-2", name: "XYZ Construction Co", email: "info@xyzcon.com" },
    bidAmount: 520000,
    proposalDocs: ["proposal-2.pdf"],
    complianceDocs: ["compliance-2.pdf"],
    status: BidStatus.Submitted,
    submittedAt: new Date("2024-10-12"),
    createdAt: new Date("2024-10-12"),
    updatedAt: new Date("2024-10-12"),
  },
  {
    id: "bid-3",
    procurementRequestId: "proc-2",
    procurementRequest: MOCK_PROCUREMENT_REQUESTS[1],
    vendorId: "vendor-3",
    vendor: { id: "vendor-3", name: "Global Services Inc", email: "sales@globalservices.com" },
    bidAmount: 1950000,
    proposalDocs: ["proposal-3.pdf"],
    complianceDocs: ["compliance-3.pdf"],
    status: BidStatus.Awarded,
    submittedAt: new Date("2024-09-25"),
    createdAt: new Date("2024-09-25"),
    updatedAt: new Date("2024-10-10"),
  },
]

export const MOCK_AWARDS: Award[] = [
  {
    id: "award-1",
    procurementRequestId: "proc-2",
    procurementRequest: MOCK_PROCUREMENT_REQUESTS[1],
    vendorId: "vendor-3",
    vendor: { id: "vendor-3", name: "Global Services Inc", email: "sales@globalservices.com" },
    contractValue: 1950000,
    awardDate: new Date("2024-10-10"),
    createdAt: new Date("2024-10-10"),
    updatedAt: new Date("2024-10-10"),
  },
]
