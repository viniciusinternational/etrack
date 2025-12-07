"use client"

import { ExpenditureListView } from "@/components/finance/expenditure-list-view"
import { useExpenditures } from "@/hooks/use-expenditure"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export default function ExpenditurePage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(['view_expenditure']);
  const { data: expenditures, isLoading } = useExpenditures()

  if (isChecking || isLoading) {
    return <div>Loading...</div>;
  }

  return <ExpenditureListView expenditures={expenditures || []} />
}
