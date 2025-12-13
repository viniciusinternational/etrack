"use client";

import { AddMilestoneModal } from "@/components/projects/add-milestone-modal";
import type {
  Project,
  MilestoneSubmission,
  MilestoneSubmissionFormInput,
} from "@/types";

// Wrapper for contractor add/edit modal that forces userRole to Contractor
export function ContractAddMilestoneModal({
  open,
  onOpenChange,
  project,
  milestones,
  contractorId,
  onSave,
  isSubmitting,
  milestone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  milestones: MilestoneSubmission[];
  contractorId: string;
  onSave: (data: MilestoneSubmissionFormInput) => Promise<void>;
  isSubmitting?: boolean;
  milestone?: MilestoneSubmission;
}) {
  return (
    <AddMilestoneModal
      open={open}
      onOpenChange={onOpenChange}
      project={project}
      milestones={milestones}
      contractorId={contractorId}
      onSave={onSave}
      isSubmitting={isSubmitting}
      milestone={milestone}
      userRole="Contractor"
    />
  );
}
