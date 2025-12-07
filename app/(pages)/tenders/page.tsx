"use client";

import { TendersListView } from "@/components/procurement/tenders-list-view";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function TendersPage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(['view_tender']);
  
  if (isChecking) {
    return <div>Loading...</div>;
  }
  
  return <TendersListView />;
}
