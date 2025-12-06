"use client"
import { ContractorProjectsListView } from "@/components/contractor/contractor-projects-list-view"
import { useSubmissions } from "@/hooks/use-submissions"
import { useContracts } from "@/hooks/use-contract"

export default function ContractorProjectsPage() {
  const { data: submissions, isLoading: isLoadingSubmissions } = useSubmissions()
  const { data: projects, isLoading: isLoadingProjects } = useContracts()

  if (isLoadingSubmissions || isLoadingProjects) return <div>Loading...</div>

  return <ContractorProjectsListView projects={projects || []} submissions={submissions || []} />
}
