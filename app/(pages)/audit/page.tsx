"use client";

import { useState } from "react";
import { useAuditLogs } from "@/hooks/use-audit";
import { Loader2 } from "lucide-react";
import { AuditListView } from "@/components/audit/audit-list-view";

export default function AuditPage() {
  const [filters, setFilters] = useState<{
    entity?: string;
    actor?: string;
    actionType?: string;
  }>({});
  
  const { data: logs, isLoading } = useAuditLogs(filters);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <AuditListView logs={logs || []} onFilterChange={setFilters} />;
}
