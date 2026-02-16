"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ExternalMeeting } from "@/types";
import { ExternalLink, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function formatDate(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export interface MeetingListViewProps {
  meetings: ExternalMeeting[];
  meta?: { total: number; limit: number; offset: number; hasMore: boolean };
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onPagePrev?: () => void;
  onPageNext?: () => void;
  onDelete?: (meeting: ExternalMeeting) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function MeetingListView({
  meetings,
  meta,
  statusFilter,
  onStatusFilterChange,
  onPagePrev,
  onPageNext,
  onDelete,
  canEdit = true,
  canDelete = true,
}: MeetingListViewProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<ExternalMeeting | null>(null);

  const handleDeleteClick = (meeting: ExternalMeeting, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(meeting);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget && onDelete) {
      onDelete(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ENDED">Ended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meetings</CardTitle>
          <CardDescription>
            {meta
              ? `Showing ${meetings.length} of ${meta.total} meetings`
              : `${meetings.length} meetings`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border w-full overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No meetings found
                    </TableCell>
                  </TableRow>
                ) : (
                  meetings.map((meeting) => (
                    <TableRow
                      key={meeting.id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => router.push(`/meetings/${meeting.id}`)}
                    >
                      <TableCell className="font-medium">{meeting.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            meeting.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {meeting.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {meeting.roomName}
                      </TableCell>
                      <TableCell>{meeting.participants?.length ?? 0}</TableCell>
                      <TableCell>{meeting.messageCount ?? 0}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(meeting.createdAt)}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {meeting.joinUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(meeting.joinUrl, "_blank", "noopener,noreferrer");
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Join
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/meetings/${meeting.id}`);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              {canEdit && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/meetings/${meeting.id}/edit`);
                                  }}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => handleDeleteClick(meeting, e)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {meta && (meta.hasMore || meta.offset > 0) && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {meta.offset + 1}–{Math.min(meta.offset + meta.limit, meta.total)} of{" "}
            {meta.total}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPagePrev}
              disabled={meta.offset === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onPageNext}
              disabled={!meta.hasMore}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              This will end the meeting &quot;{deleteTarget?.title}&quot;. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
