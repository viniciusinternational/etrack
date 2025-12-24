"use client";
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  User,
  ExternalLink,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CalendarEvent, EventType } from "@/types";

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
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

export function EventDetailView({
  event,
  onBack,
  onEdit,
}: {
  event: CalendarEvent;
  onBack: () => void;
  onEdit: () => void;
}) {
  const isMeeting = event.eventType === EventType.MEETING;
  const hasJoinUrl = !!event.joinUrl;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Event Details
            </h1>
            <p className="text-muted-foreground mt-1">
              View event information
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{event.title}</CardTitle>
              <div className="flex gap-2">
                {event.eventType && (
                  <Badge
                    variant={
                      event.eventType === EventType.MEETING
                        ? "default"
                        : "outline"
                    }
                  >
                    {event.eventType === EventType.MEETING
                      ? "Meeting"
                      : "General"}
                  </Badge>
                )}
                {event.status && (
                  <Badge variant="outline" className="capitalize">
                    {event.status.replace("-", " ")}
                  </Badge>
                )}
                {event.priority && (
                  <Badge
                    variant={
                      event.priority === "high"
                        ? "destructive"
                        : event.priority === "medium"
                        ? "default"
                        : "outline"
                    }
                    className="capitalize"
                  >
                    {event.priority}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Date
                </h3>
                <p className="text-foreground">
                  {formatDate(event.date)}
                </p>
              </div>

              {(event.startTime || event.endTime) && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Time
                  </h3>
                  <p className="text-foreground">
                    {event.startTime && event.endTime
                      ? `${event.startTime} - ${event.endTime}`
                      : event.startTime || event.endTime || "All day"}
                  </p>
                </div>
              )}
            </div>

            {event.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Description
                </h3>
                <p className="text-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {event.project && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Project
                  </h3>
                  <p className="text-foreground">{event.project}</p>
                </div>
              )}

              {event.contractor && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <User className="h-4 w-4" /> Contractor
                  </h3>
                  <p className="text-foreground">{event.contractor}</p>
                </div>
              )}
            </div>

            {isMeeting && (
              <div className="border-t pt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Meeting Information
                  </h3>
                  {event.meetingId && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">
                        Meeting ID
                      </p>
                      <p className="text-sm font-mono text-foreground">
                        {event.meetingId}
                      </p>
                    </div>
                  )}
                  {hasJoinUrl && (
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => {
                        window.open(event.joinUrl, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Join Meeting
                    </Button>
                  )}
                  {!hasJoinUrl && (
                    <p className="text-sm text-muted-foreground">
                      Meeting link is not available
                    </p>
                  )}
                </div>

                {event.participants && event.participants.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Participants
                    </h3>
                    <div className="space-y-2">
                      {event.participants.map((participant, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {participant.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {participant.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="text-sm">
                  {event.createdAt
                    ? formatDate(event.createdAt)
                    : "Unknown"}
                </p>
              </div>
              {event.updatedAt && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Last Updated
                  </p>
                  <p className="text-sm">{formatDate(event.updatedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

