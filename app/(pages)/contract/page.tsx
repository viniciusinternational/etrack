"use client"
import { ContractorProjectsListView } from "@/components/contractor/contractor-projects-list-view"
import { useSubmissions } from "@/hooks/use-submissions"
import { useContracts } from "@/hooks/use-contract"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export default function ContractorProjectsPage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(['view_contract']);
  const { data: submissions, isLoading: isLoadingSubmissions } = useSubmissions()
  const { data: projects, isLoading: isLoadingProjects } = useContracts()

  if (isChecking || isLoadingSubmissions || isLoadingProjects) {
    return <div>Loading...</div>;
  }

  return <ContractorProjectsListView projects={projects || []} submissions={submissions || []} />
}
