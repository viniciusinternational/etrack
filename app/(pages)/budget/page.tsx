"use client"

import { BudgetListView } from "@/components/finance/budget-list-view"
import { useBudgets, useDeleteBudget } from "@/hooks/use-budget"

export default function BudgetPage() {
  const { data: budgets, isLoading } = useBudgets()
  const { mutate: deleteBudget } = useDeleteBudget()

  const handleDeleteBudget = (id: string) => {
    deleteBudget(id)
  }

  if (isLoading) return <div>Loading...</div>

  return <BudgetListView budgets={budgets || []} onDeleteBudget={handleDeleteBudget} />
}
