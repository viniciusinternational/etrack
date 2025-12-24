"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventListView } from "@/components/events/event-list-view";
import { useEvents } from "@/hooks/use-events";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Loader2 } from "lucide-react";

export default function EventsPage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(['view_event']);
  const { data: events, isLoading } = useEvents();

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
            <h1 className="text-3xl font-bold text-foreground">Events</h1>
            <p className="text-muted-foreground mt-1">
              Manage calendar events and meetings
            </p>
          </div>
          <Link href="/events/new" className="w-full sm:w-auto">
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>

        <EventListView events={events || []} />
      </div>
    </div>
  );
}
