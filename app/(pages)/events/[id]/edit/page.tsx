"use client";

import { useRouter, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { EventFormView } from "@/components/events/event-form-view";
import { useEvent } from "@/hooks/use-events";
import { useUpdateEvent } from "@/hooks/use-events";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { CalendarEvent, EventType } from "@/types";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: event, isLoading } = useEvent(id);
  const updateEvent = useUpdateEvent();
  const [isSaving, setIsSaving] = useState(false);

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
    router.push(`/events/${id}`);
  };

  const handleSave = async (data: {
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    project?: string;
    status?: string;
    priority?: string;
    description?: string;
    contractor?: string;
    eventType?: EventType;
    participants?: Array<{ email: string; name: string }>;
  }) => {
    setIsSaving(true);
    try {
      await updateEvent.mutateAsync({
        id,
        ...data,
        date: new Date(data.date).toISOString(),
      });
      toast.success("Event updated successfully");
      router.push(`/events/${id}`);
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <EventFormView
          event={event as CalendarEvent}
          onBack={handleBack}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}

