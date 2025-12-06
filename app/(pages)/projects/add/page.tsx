"use client";
import { useRouter } from "next/navigation";
import { ProjectFormView } from "@/components/global/project-form-view";
import { useCreateProject } from "@/hooks/use-projects";
import { useMDAs } from "@/hooks/use-mdas";
import { useUsers } from "@/hooks/use-users";
import { Loader2 } from "lucide-react";
import type { Project, ProjectFormInput } from "@/types";
import { UserRole, ProjectStatus } from "@/types";

export default function AddProjectPage() {
  const router = useRouter();
  const { mutate: createProject, isPending } = useCreateProject();
  const { data: mdas, isLoading: isLoadingMDAs } = useMDAs();
  const { data: users, isLoading: isLoadingUsers } = useUsers();

  const contractors = users?.filter(u => u.role === UserRole.Contractor) || [];

  const handleSave = (input: ProjectFormInput) => {
    const newProject: Project = {
      ...input,
      id: crypto.randomUUID(),
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      status: ProjectStatus.Planned,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    createProject(newProject, {
      onSuccess: () => {
        router.push("/projects");
      },
      onError: (error) => {
        console.error("Failed to create project:", error);
      },
    });
  };

  if (isPending || isLoadingMDAs || isLoadingUsers) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProjectFormView
      project={null}
      mdas={mdas || []}
      contractors={contractors}
      onBack={() => router.back()}
      onSave={handleSave}
      isSaving={isPending}
    />
  );
}
