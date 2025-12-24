"use client";

import { useRouter } from "next/navigation";
import { EventFormView } from "@/components/events/event-form-view";
import { useCreateEvent } from "@/hooks/use-events";
import { toast } from "sonner";
import { useState } from "react";
import type { EventType } from "@/types";

export default function NewEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = () => {
    router.push("/events");
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
      const newEvent = await createEvent.mutateAsync({
        ...data,
        date: new Date(data.date).toISOString(),
      });
      toast.success("Event created successfully");
      router.push(`/events/${newEvent.id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <EventFormView
          event={null}
          onBack={handleBack}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}

