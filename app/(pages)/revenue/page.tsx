"use client"

import { RevenueListView } from "@/components/finance/revenue-list-view"
import { useRevenues } from "@/hooks/use-revenue"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export default function RevenuePage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(['view_revenue']);
  const { data: revenues, isLoading } = useRevenues()

  if (isChecking || isLoading) {
    return <div>Loading...</div>;
  }

  return <RevenueListView revenues={revenues || []}  />
}
