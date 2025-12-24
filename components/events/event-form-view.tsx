"use client";
import type React from "react";
import { useState } from "react";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CalendarEvent, MeetingParticipant } from "@/types";
import { EventType, EventStatus, EventPriority } from "@/types";

interface EventFormInput {
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  project?: string;
  status?: EventStatus;
  priority?: EventPriority;
  description?: string;
  contractor?: string;
  eventType?: EventType;
  participants?: MeetingParticipant[];
}

export function EventFormView({
  event,
  onBack,
  onSave,
  isSaving = false,
}: {
  event: CalendarEvent | null;
  onBack: () => void;
  onSave: (data: EventFormInput) => void;
  isSaving?: boolean;
}) {
  const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  const formatDateTimeForInput = (date: Date | string | undefined): string => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<EventFormInput>({
    title: event?.title || "",
    date: formatDateForInput(event?.date),
    startTime: event?.startTime || "",
    endTime: event?.endTime || "",
    project: event?.project || "",
    status: event?.status || undefined,
    priority: event?.priority || undefined,
    description: event?.description || "",
    contractor: event?.contractor || "",
    eventType: event?.eventType || EventType.GENERAL,
    participants: event?.participants || [],
  });

  const [participants, setParticipants] = useState<MeetingParticipant[]>(
    formData.participants || []
  );

  const addParticipant = () => {
    setParticipants([...participants, { email: "", name: "" }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (
    index: number,
    field: "email" | "name",
    value: string
  ) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      participants: formData.eventType === EventType.MEETING ? participants.filter(p => p.email && p.name) : undefined,
    });
  };

  const isMeetingType = formData.eventType === EventType.MEETING;

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {event ? "Edit Event" : "Create Event"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {event ? "Update event details" : "Create a new calendar event"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
            <CardDescription>Fill in the event details</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type *</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    eventType: value as EventType,
                  })
                }
              >
                <SelectTrigger id="eventType" className="w-[240px]">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EventType.GENERAL}>General</SelectItem>
                  <SelectItem value={EventType.MEETING}>Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as EventStatus,
                    })
                  }
                >
                  <SelectTrigger id="status" className="w-[240px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="on-track">On Track</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      priority: value as EventPriority,
                    })
                  }
                >
                  <SelectTrigger id="priority" className="w-[240px]">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input
                  id="project"
                  placeholder="Enter project name"
                  value={formData.project}
                  onChange={(e) =>
                    setFormData({ ...formData, project: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter event description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractor">Contractor</Label>
              <Input
                id="contractor"
                placeholder="Enter contractor name"
                value={formData.contractor}
                onChange={(e) =>
                  setFormData({ ...formData, contractor: e.target.value })
                }
              />
            </div>

            {isMeetingType && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Participants (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addParticipant}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Participant
                  </Button>
                </div>

                {participants.length > 0 && (
                  <div className="space-y-3">
                    {participants.map((participant, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
                      >
                        <div className="space-y-2">
                          <Label htmlFor={`participant-email-${index}`}>
                            Email
                          </Label>
                          <Input
                            id={`participant-email-${index}`}
                            type="email"
                            placeholder="email@example.com"
                            value={participant.email}
                            onChange={(e) =>
                              updateParticipant(index, "email", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`participant-name-${index}`}>
                            Name
                          </Label>
                          <Input
                            id={`participant-name-${index}`}
                            placeholder="Full Name"
                            value={participant.name}
                            onChange={(e) =>
                              updateParticipant(index, "name", e.target.value)
                            }
                            maxLength={120}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipant(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {participants.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No participants added. You can add participants later or
                    leave this empty.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {event ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
}

