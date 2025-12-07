"use client";

import { ContractorCalendarDashboard } from "@/components/contractor/contractor-calendar-dashboard";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function ContractorDashboardPage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(['view_event']);
  
  if (isChecking) {
    return <div>Loading...</div>;
  }
  
  return <ContractorCalendarDashboard />;
}
