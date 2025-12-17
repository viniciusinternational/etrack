"use client";

import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuditLogs } from "@/hooks/use-audit";
import { Loader2 } from "lucide-react";
import { AuditListView } from "@/components/audit/audit-list-view";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function AuditPage() {
  const searchParams = useSearchParams();
  const actorFromQuery = searchParams.get("actor");

  console.log("AuditPage render - actorFromQuery:", actorFromQuery);

  const { isChecking } = useAuthGuard(["view_audit"]);

  const initialActor = useMemo(() => actorFromQuery, []);

  const [filters, setFilters] = useState<{
    entity?: string;
    actor?: string;
    actionType?: string;
  }>({});

  console.log("Current filters state:", filters);

  // Memoize the callback so it doesn't change on every render
  const handleFilterChange = useCallback(
    (newFilters: { entity?: string; actor?: string; actionType?: string }) => {
      console.log("handleFilterChange called with:", newFilters);
      setFilters(newFilters);
    },
    []
  );

  const { data: logs, isLoading } = useAuditLogs(filters);

  console.log("Logs data:", logs);

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
      onFilterChange={handleFilterChange}
      initialActorFilter={initialActor || undefined}
    />
  );
}
