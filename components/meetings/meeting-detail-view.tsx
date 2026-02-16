"use client";

import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Users,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExternalMeeting } from "@/types";

function formatDate(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MeetingDetailView({
  meeting,
  onBack,
  onEdit,
  onDelete,
}: {
  meeting: ExternalMeeting;
  onBack: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meeting Details</h1>
            <p className="text-muted-foreground mt-1">View meeting information</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {meeting.joinUrl && (
            <Button
              onClick={() => window.open(meeting.joinUrl, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Join Meeting
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{meeting.title}</CardTitle>
              <Badge variant={meeting.status === "ACTIVE" ? "default" : "secondary"}>
                {meeting.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Room
                </h3>
                <p className="font-mono text-foreground">{meeting.roomName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Messages
                </h3>
                <p className="text-foreground">{meeting.messageCount ?? 0}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" /> Participants
              </h3>
              {meeting.participants && meeting.participants.length > 0 ? (
                <div className="space-y-2">
                  {meeting.participants.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No participants</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Meeting Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="text-sm">{formatDate(meeting.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                <p className="text-sm">{formatDate(meeting.updatedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Meeting ID</p>
                <p className="text-sm font-mono break-all">{meeting.id}</p>
              </div>
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-4"
                  onClick={onDelete}
                >
                  End / Delete Meeting
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
