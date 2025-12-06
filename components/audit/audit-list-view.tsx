"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuditLog, AuditActionType } from "@/types";
import { GlobalTable } from "@/components/global/global-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AuditListViewProps {
  logs: AuditLog[];
  onFilterChange: (filters: { entity?: string; actor?: string; actionType?: string }) => void;
}

export function AuditListView({ logs, onFilterChange }: AuditListViewProps) {
  const router = useRouter();
  const [entityFilter, setEntityFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("");

  const handleFilterChange = () => {
    onFilterChange({
      entity: entityFilter || undefined,
      actor: actorFilter || undefined,
      actionType: actionTypeFilter || undefined,
    });
  };

  const getActionBadge = (actionType: AuditActionType) => {
    const variants: Record<AuditActionType, "default" | "secondary" | "destructive" | "outline"> = {
      [AuditActionType.CREATE]: "default",
      [AuditActionType.UPDATE]: "secondary",
      [AuditActionType.DELETE]: "destructive",
      [AuditActionType.VIEW]: "outline",
      [AuditActionType.EXPORT]: "outline",
      [AuditActionType.LOGIN]: "outline",
      [AuditActionType.LOGOUT]: "outline",
    };
    return <Badge variant={variants[actionType]}>{actionType}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      SUCCESS: "default",
      FAILED: "destructive",
      PENDING: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => {
        const date = new Date(row.original.timestamp);
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-muted-foreground">{date.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "actor",
      header: "Actor",
      cell: ({ row }) => <div className="font-medium">{row.original.actor}</div>,
    },
    {
      accessorKey: "entity",
      header: "Entity",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.entity}</div>
          {row.original.entityId && (
            <div className="text-xs text-muted-foreground">ID: {row.original.entityId.substring(0, 8)}...</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "actionType",
      header: "Action",
      cell: ({ row }) => getActionBadge(row.original.actionType),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-md truncate text-sm">{row.original.description}</div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">
          Track all system activities and changes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter audit logs by entity, actor, or action type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entity">Entity</Label>
              <Input
                id="entity"
                placeholder="e.g., Project, User"
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actor">Actor</Label>
              <Input
                id="actor"
                placeholder="User ID or name"
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type</Label>
              <Select value={actionTypeFilter || undefined} onValueChange={(value) => setActionTypeFilter(value)}>
                <SelectTrigger id="actionType">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="VIEW">View</SelectItem>
                  <SelectItem value="EXPORT">Export</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleFilterChange} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <GlobalTable 
        columns={columns} 
        data={logs}
        title="Audit Trail"
        description={`Showing ${logs.length} recent audit log${logs.length !== 1 ? "s" : ""}`}
        searchPlaceholder="Search audit logs..."
        searchKey="description"
        onRowClick={(row) => router.push(`/audit/${row.id}`)}
      />
    </div>
  );
}
