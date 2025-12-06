import { ProjectCategory, ProjectStatus, MilestoneStage } from "@/types";

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const formatDateLong = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const getStatusColor = (status: ProjectStatus) => {
  const colors = {
    [ProjectStatus.Planned]: "bg-blue-100 text-blue-800",
    [ProjectStatus.InProgress]: "bg-yellow-100 text-yellow-800",
    [ProjectStatus.Delayed]: "bg-red-100 text-red-800",
    [ProjectStatus.Completed]: "bg-green-100 text-green-800",
  };
  return colors[status];
};

export const getCategoryColor = (category: ProjectCategory) => {
  const colors = {
    [ProjectCategory.Infrastructure]: "bg-purple-100 text-purple-800",
    [ProjectCategory.Healthcare]: "bg-pink-100 text-pink-800",
    [ProjectCategory.Education]: "bg-indigo-100 text-indigo-800",
    [ProjectCategory.Agriculture]: "bg-green-100 text-green-800",
    [ProjectCategory.Technology]: "bg-blue-100 text-blue-800",
    [ProjectCategory.Environment]: "bg-teal-100 text-teal-800",
    [ProjectCategory.Housing]: "bg-orange-100 text-orange-800",
  };
  return colors[category];
};

export const getMilestoneStageLabel = (stage: MilestoneStage) => {
  const labels = {
    [MilestoneStage.PreConstruction]: "Pre-Construction",
    [MilestoneStage.Foundation]: "Foundation",
    [MilestoneStage.Superstructure]: "Superstructure",
    [MilestoneStage.Finishing]: "Finishing",
    [MilestoneStage.TestingCommissioning]: "Testing & Commissioning",
    [MilestoneStage.Handover]: "Handover",
  };
  return labels[stage] ?? stage;
};
