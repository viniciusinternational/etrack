"use client";
import { useRouter, useParams } from "next/navigation";
import { ProjectFormView } from "@/components/global/project-form-view";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { useMDAs } from "@/hooks/use-mdas";
import { useUsers } from "@/hooks/use-users";
import { Loader2 } from "lucide-react";
import type { Project, ProjectFormInput } from "@/types";
import { UserRole } from "@/types";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading } = useProject(projectId);
  const { mutate: updateProject, isPending: isSaving } = useUpdateProject();
  const { data: mdas, isLoading: isLoadingMDAs } = useMDAs();
  const { data: users, isLoading: isLoadingUsers } = useUsers();

  const contractors = users?.filter(u => u.role === UserRole.Contractor) || [];

  const handleSave = (input: ProjectFormInput) => {
    if (!project) return;
    
    updateProject(
      {
        id: projectId,
        ...input,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        status: project.status,
      },
      {
        onSuccess: () => {
          router.push(`/projects/${projectId}`);
        },
      }
    );
  };

  if (isLoading || isLoadingMDAs || isLoadingUsers) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <button
          onClick={() => router.back()}
          className="text-blue-500 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <ProjectFormView
      project={project}
      mdas={mdas || []}
      contractors={contractors}
      onBack={() => router.back()}
      onSave={handleSave}
      isSaving={isSaving}
    />
  );
}
