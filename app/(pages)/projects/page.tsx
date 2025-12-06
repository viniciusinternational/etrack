"use client";
import { ProjectListView } from "@/components/global/project-list-view";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const { mutate: deleteProject } = useDeleteProject();

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <ProjectListView
        projects={projects || []}
        onDeleteProject={handleDeleteProject}
      />
    </div>
  );
}
