export enum ProcurementStatus {
  Open = "Open",
  Bidding = "Bidding",
  Awarded = "Awarded",
  Closed = "Closed",
}

export enum BidStatus {
  Submitted = "Submitted",
  Rejected = "Rejected",
  Awarded = "Awarded",
}

export interface ProcurementRequest {
  id: string
  mdaId: string
  mda?: {
    id: string
    name: string
  }
  title: string
  description: string
  estimatedCost: number
  requestDate: Date
  status: ProcurementStatus
  documents: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Bid {
  id: string
  procurementRequestId: string
  procurementRequest?: ProcurementRequest
  vendorId: string
  vendor?: {
    id: string
    name: string
    email: string
  }
  bidAmount: number
  proposalDocs: string[]
  complianceDocs: string[]
  status: BidStatus
  submittedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface Award {
  id: string
  procurementRequestId: string
  procurementRequest?: ProcurementRequest
  vendorId: string
  vendor?: {
    id: string
    name: string
    email: string
  }
  contractValue: number
  awardDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface ProcurementFormData {
  title: string
  description: string
  estimatedCost: number
  mdaId: string
  documents?: string[]
}

export interface BidFormData {
  bidAmount: number
  proposalDocs: string[]
  complianceDocs: string[]
}
