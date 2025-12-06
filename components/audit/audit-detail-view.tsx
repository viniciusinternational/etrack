"use client";

import { AuditLog } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface AuditDetailViewProps {
  log: AuditLog;
  onBack: () => void;
}

export function AuditDetailView({ log, onBack }: AuditDetailViewProps) {
  const getActionBadge = (actionType: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      CREATE: "default",
      UPDATE: "secondary",
      DELETE: "destructive",
      VIEW: "outline",
      EXPORT: "outline",
      LOGIN: "outline",
      LOGOUT: "outline",
    };
    return <Badge variant={variants[actionType] || "default"}>{actionType}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      SUCCESS: "default",
      FAILED: "destructive",
      PENDING: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const formatJson = (data: Record<string, unknown> | null | undefined) => {
    if (!data) return "";
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Audit Log Details</h1>
          <p className="text-muted-foreground mt-1">
            {new Date(log.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Basic audit log details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Log ID</div>
              <div className="font-mono text-sm">{log.id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Actor</div>
              <div className="font-medium">{log.actor}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Entity</div>
              <div className="font-medium">{log.entity}</div>
            </div>
            {log.entityId && (
              <div>
                <div className="text-sm text-muted-foreground">Entity ID</div>
                <div className="font-mono text-sm">{log.entityId}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Action Type</div>
              <div>{getActionBadge(log.actionType)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div>{getStatusBadge(log.status)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Timestamp</div>
              <div className="font-medium">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Technical details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Description</div>
              <div className="font-medium">{log.description}</div>
            </div>
            {log.ipAddress && (
              <div>
                <div className="text-sm text-muted-foreground">IP Address</div>
                <div className="font-mono text-sm">{log.ipAddress}</div>
              </div>
            )}
            {log.userAgent && (
              <div>
                <div className="text-sm text-muted-foreground">User Agent</div>
                <div className="font-mono text-xs break-all">{log.userAgent}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(log.before || log.after) && (
        <Card>
          <CardHeader>
            <CardTitle>Data Changes</CardTitle>
            <CardDescription>
              {log.actionType === "UPDATE"
                ? "Before and after comparison"
                : log.actionType === "CREATE"
                ? "Created data"
                : "Deleted data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {log.actionType === "UPDATE" && log.before && log.after ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Before:</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                    {formatJson(log.before)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">After:</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                    {formatJson(log.after)}
                  </pre>
                </div>
              </div>
            ) : log.actionType === "CREATE" && log.after ? (
              <div>
                <h3 className="font-semibold mb-2">Created Data:</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-auto">
                  {formatJson(log.after)}
                </pre>
              </div>
            ) : log.actionType === "DELETE" && log.before ? (
              <div>
                <h3 className="font-semibold mb-2">Deleted Data:</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-auto">
                  {formatJson(log.before)}
                </pre>
              </div>
            ) : (
              <div className="text-muted-foreground">No data changes recorded</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
