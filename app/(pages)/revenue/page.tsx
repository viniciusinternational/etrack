"use client"

import { RevenueListView } from "@/components/finance/revenue-list-view"
import { useRevenues } from "@/hooks/use-revenue"

export default function RevenuePage() {
  const { data: revenues, isLoading } = useRevenues()

  if (isLoading) return <div>Loading...</div>

  return <RevenueListView revenues={revenues || []}  />
}
