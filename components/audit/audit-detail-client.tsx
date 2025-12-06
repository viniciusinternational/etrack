"use client";

import { useRouter } from "next/navigation";
import { useAuditLog } from "@/hooks/use-audit";
import { Loader2 } from "lucide-react";
import { AuditDetailView } from "./audit-detail-view";

export default function AuditDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: log, isLoading } = useAuditLog(id);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Audit log not found
          </h1>
          <button
            onClick={() => router.push("/audit")}
            className="mt-4 text-primary hover:underline"
          >
            Back to Audit Logs
          </button>
        </div>
      </div>
    );
  }

  return <AuditDetailView log={log} onBack={() => router.back()} />;
}
