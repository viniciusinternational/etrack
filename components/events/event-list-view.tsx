"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlobalTable } from "@/components/global/global-table";
import { CalendarEvent, EventType } from "@/types";
import { ExternalLink } from "lucide-react";

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date: Date | string, time?: string): string {
  const dateStr = formatDate(date);
  if (time) {
    return `${dateStr} at ${time}`;
  }
  return dateStr;
}

export function EventListView({
  events,
}: {
  events: CalendarEvent[];
}) {
  const columns: ColumnDef<CalendarEvent>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    {
      accessorKey: "eventType",
      header: "Type",
      cell: ({ row }) => {
        const eventType = row.original.eventType || EventType.GENERAL;
        return (
          <Badge
            variant={eventType === EventType.MEETING ? "default" : "outline"}
          >
            {eventType === EventType.MEETING ? "Meeting" : "General"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date & Time",
      cell: ({ row }) => (
        <div className="text-sm">
          {formatDateTime(row.original.date, row.original.startTime)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        if (!status) return <span className="text-muted-foreground">-</span>;
        return (
          <Badge variant="outline" className="capitalize">
            {status.replace("-", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.original.priority;
        if (!priority) return <span className="text-muted-foreground">-</span>;
        return (
          <Badge
            variant={
              priority === "high"
                ? "destructive"
                : priority === "medium"
                ? "default"
                : "outline"
            }
            className="capitalize"
          >
            {priority}
          </Badge>
        );
      },
    },
    {
      accessorKey: "project",
      header: "Project",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.project || <span className="text-muted-foreground">-</span>}
        </div>
      ),
    },
    {
      id: "joinUrl",
      header: "Join",
      cell: ({ row }) => {
        const event = row.original;
        if (
          event.eventType === EventType.MEETING &&
          event.joinUrl
        ) {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(event.joinUrl, "_blank", "noopener,noreferrer");
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Join
            </Button>
          );
        }
        return <span className="text-muted-foreground">-</span>;
      },
    },
  ];

  return (
    <GlobalTable
      data={events}
      columns={columns}
      title="Events"
      searchKey="title"
      searchPlaceholder="Search events..."
      rowClickHref={(row) => `/events/${row.id}`}
    />
  );
}

