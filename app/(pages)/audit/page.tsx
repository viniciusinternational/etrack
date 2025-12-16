"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuditLogs } from "@/hooks/use-audit";
import { Loader2 } from "lucide-react";
import { AuditListView } from "@/components/audit/audit-list-view";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function AuditPage() {
  const searchParams = useSearchParams();
  const actorFromQuery = searchParams.get("actor");

  // Check authentication and permission
  const { isChecking } = useAuthGuard(["view_audit"]);

  // Initialize filters with actor from query if present
  const [filters, setFilters] = useState<{
    entity?: string;
    actor?: string;
    actionType?: string;
  }>({
    actor: actorFromQuery || undefined,
  });

  // Update filters when query params change
  useEffect(() => {
    if (actorFromQuery) {
      setFilters((prev) => ({ ...prev, actor: actorFromQuery }));
    }
  }, [actorFromQuery]);

  const { data: logs, isLoading } = useAuditLogs(filters);

  if (isChecking || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuditListView
      logs={logs || []}
      onFilterChange={setFilters}
      initialActorFilter={actorFromQuery || undefined}
    />
  );
}
