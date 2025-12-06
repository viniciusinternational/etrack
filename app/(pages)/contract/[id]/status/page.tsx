"use client";
import { useRouter, useParams } from "next/navigation";
import { MilestoneStatusView } from "@/components/contractor/milestone-status-view";
import { useSubmissions } from "@/hooks/use-submissions";
import { useContract } from "@/hooks/use-contract";

export default function MilestoneStatusPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { data: project } = useContract(projectId);
  const { data: submissions, isLoading } = useSubmissions();

  const handleBack = () => {
    router.push("/contract/");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <MilestoneStatusView
      projectId={projectId}
      submissions={submissions || []}
      projectTitle={project?.title}
      onBack={handleBack}
    />
  );
}
