import { MilestoneStage, SubmissionStatus } from "@/types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getMilestoneLabel(stage: MilestoneStage): string {
  const labels: Record<MilestoneStage, string> = {
    [MilestoneStage.PreConstruction]: "Pre-Construction",
    [MilestoneStage.Foundation]: "Foundation",
    [MilestoneStage.Superstructure]: "Superstructure",
    [MilestoneStage.Finishing]: "Finishing",
    [MilestoneStage.TestingCommissioning]: "Testing & Commissioning",
    [MilestoneStage.Handover]: "Handover",
  };
  return labels[stage];
}

export function getStatusColor(status: SubmissionStatus): string {
  const colors: Record<SubmissionStatus, string> = {
    [SubmissionStatus.Pending]: "bg-yellow-100 text-yellow-800",
    [SubmissionStatus.Approved]: "bg-green-100 text-green-800",
    [SubmissionStatus.Rejected]: "bg-red-100 text-red-800",
  };
  return colors[status];
}
