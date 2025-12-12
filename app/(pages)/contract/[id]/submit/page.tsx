"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MilestoneSubmissionFormView } from "@/components/contractor/milestone-submission-form-view";
import { useCreateSubmission } from "@/hooks/use-submissions";
import { useContract } from "@/hooks/use-contract";
import type { MilestoneSubmissionFormInput } from "@/types";
import { toast } from "sonner";

export default function SubmitMilestonePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [open, setOpen] = useState(true);

  const { data: project } = useContract(projectId);
  const { mutateAsync: createSubmission, isPending } = useCreateSubmission();

  const handleSave = async (input: MilestoneSubmissionFormInput) => {
    try {
      await createSubmission({
        ...input,
        projectId,
        contractorId: project?.contractorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      toast.success("Milestone submitted successfully");

      setOpen(false);
      router.push(`/contract/${projectId}/status`);
    } catch (error) {
      toast.error("Failed to submit milestone");
    }
  };

  const handleClose = () => {
    setOpen(false);
    router.push(`/contract/${projectId}/status`);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Submit Milestone Documents</DialogTitle>
        </DialogHeader>

        <MilestoneSubmissionFormView
          projectId={projectId}
          submission={null}
          projectTitle={project?.title}
          contractorId={project?.contractorId}
          onBack={handleClose}
          onSave={handleSave}
          isSubmitting={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
