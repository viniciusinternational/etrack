"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MeetingListView } from "@/components/meetings/meeting-list-view";
import { useMeetings, useDeleteMeeting } from "@/hooks/use-meetings";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ExternalMeeting } from "@/types";

const PAGE_SIZE = 20;

export default function MeetingsPage() {
  const { isChecking } = useAuthGuard(["view_meeting"]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [offset, setOffset] = useState(0);

  const statusParam =
    statusFilter === "ACTIVE" || statusFilter === "ENDED" ? statusFilter : undefined;

  const { data, isLoading } = useMeetings({
    status: statusParam,
    limit: PAGE_SIZE,
    offset,
  });

  const deleteMeeting = useDeleteMeeting();

  const meetings = data?.data ?? [];
  const meta = data?.meta;

  const handleDelete = async (meeting: ExternalMeeting) => {
    try {
      await deleteMeeting.mutateAsync(meeting.id);
      toast.success("Meeting ended");
    } catch {
      toast.error("Failed to end meeting");
    }
  };

  if (isChecking || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meetings</h1>
            <p className="text-muted-foreground mt-1">
              Manage instant meetings and view join links
            </p>
          </div>
          <Link href="/meetings/new" className="w-full sm:w-auto">
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create Meeting
            </Button>
          </Link>
        </div>

        <MeetingListView
          meetings={meetings}
          meta={meta}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onPagePrev={() => setOffset((p) => Math.max(0, p - PAGE_SIZE))}
          onPageNext={() => setOffset((p) => p + PAGE_SIZE)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
