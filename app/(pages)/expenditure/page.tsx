"use client"

import { ExpenditureListView } from "@/components/finance/expenditure-list-view"
import { useExpenditures } from "@/hooks/use-expenditure"

export default function ExpenditurePage() {
  const { data: expenditures, isLoading } = useExpenditures()

  if (isLoading) return <div>Loading...</div>

  return <ExpenditureListView expenditures={expenditures || []} />
}
