"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuditLog, AuditActionType } from "@/types";
import { GlobalTable } from "@/components/global/global-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { it } from "node:test";

interface AuditListViewProps {
  logs: AuditLog[];
  onFilterChange: (filters: {
    entity?: string;
    actor?: string;
    actionType?: string;
  }) => void;
  initialActorFilter?: string;
}

export function AuditListView({
  logs,
  onFilterChange,
  initialActorFilter,
}: AuditListViewProps) {
  const router = useRouter();
  const hasInitialized = useRef(false);
  const onFilterChangeRef = useRef(onFilterChange);

  // Keep ref updated
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  const [entityFilter, setEntityFilter] = useState(() => "");
  const [actorFilter, setActorFilter] = useState(() => "");
  const [actionTypeFilter, setActionTypeFilter] = useState(() => "");

  // Only set initial values once on mount

  const handleApplyFilters = () => {
    console.log("Applying filters:", {
      entityFilter,
      actorFilter,
      actionTypeFilter,
    });
    onFilterChangeRef.current({
      entity: entityFilter || undefined,
      actor: actorFilter || undefined,
      actionType: actionTypeFilter || undefined,
    });
  };

  const handleClearFilters = () => {
    console.log("Clearing filters");
    setEntityFilter("");
    setActorFilter("");
    setActionTypeFilter("");
    onFilterChangeRef.current({});
  };

  const handleActionTypeChange = (value: string) => {
    setActionTypeFilter(value === "ALL" ? "" : value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  const getActionBadge = (actionType: AuditActionType) => {
    const variants: Record<
      AuditActionType,
      "default" | "secondary" | "destructive" | "outline"
    > = {
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
            <div className="text-muted-foreground">
              {date.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "actor",
      header: "Actor",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.actor}</div>
      ),
    },
    {
      accessorKey: "entity",
      header: "Entity",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.entity}</div>
          {row.original.entityId && (
            <div className="text-xs text-muted-foreground">
              ID: {row.original.entityId.substring(0, 8)}...
            </div>
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
        <div className="max-w-md truncate text-sm">
          {row.original.description}
        </div>
      ),
    },
  ];

  const hasActiveFilters = entityFilter || actorFilter || actionTypeFilter;

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
          <CardDescription>
            Filter audit logs by entity, actor, or action type
          </CardDescription>
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
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actor">Actor</Label>
              <Input
                id="actor"
                placeholder="User ID or email"
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type</Label>
              <Select
                value={actionTypeFilter || "ALL"}
                onValueChange={handleActionTypeChange}
              >
                <SelectTrigger id="actionType">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All actions</SelectItem>
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
            <div className="flex items-end gap-2">
              <Button onClick={handleApplyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="flex-1"
                disabled={!hasActiveFilters}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <GlobalTable
        columns={columns}
        data={logs}
        title="Audit Trail"
        description={`Showing ${logs.length} audit log${
          logs.length !== 1 ? "s" : ""
        }`}
        initialSearchTerm={initialActorFilter || ""}
        searchPlaceholder="Search audit logs..."
        searchKey="description"
        onRowClick={(row) => router.push(`/audit/${row.id}`)}
      />
    </div>
  );
}
