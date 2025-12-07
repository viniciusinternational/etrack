"use client"

import { BudgetListView } from "@/components/finance/budget-list-view"
import { useBudgets, useDeleteBudget } from "@/hooks/use-budget"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export default function BudgetPage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(['view_budget']);
  const { data: budgets, isLoading } = useBudgets()
  const { mutate: deleteBudget } = useDeleteBudget()

  const handleDeleteBudget = (id: string) => {
    deleteBudget(id)
  }

  if (isChecking || isLoading) {
    return <div>Loading...</div>;
  }

  return <BudgetListView budgets={budgets || []} onDeleteBudget={handleDeleteBudget} />
}
