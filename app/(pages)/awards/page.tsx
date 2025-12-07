"use client";

import { AwardsListView } from "@/components/procurement/awards-list-view"
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function AwardsPage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(['view_award']);
  
  if (isChecking) {
    return <div>Loading...</div>;
  }
  
  return <AwardsListView />
}
