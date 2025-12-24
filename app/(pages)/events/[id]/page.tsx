"use client";

import { useRouter, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { EventDetailView } from "@/components/events/event-detail-view";
import { useEvent } from "@/hooks/use-events";
import { Loader2 } from "lucide-react";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: event, isLoading } = useEvent(id);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const handleBack = () => {
    router.push("/events");
  };

  const handleEdit = () => {
    router.push(`/events/${id}/edit`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <EventDetailView
          event={event}
          onBack={handleBack}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
}

