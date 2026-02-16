"use client";

import type React from "react";
import { useState } from "react";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MeetingParticipant } from "@/types";

export interface CreateMeetingInput {
  title: string;
  participants?: MeetingParticipant[];
}

export function MeetingFormView({
  onBack,
  onSubmit,
  isSubmitting = false,
}: {
  onBack: () => void;
  onSubmit: (data: CreateMeetingInput) => void;
  isSubmitting?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);

  const addParticipant = () => {
    setParticipants([...participants, { email: "", name: "" }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: "email" | "name", value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      participants: participants.filter((p) => p.email && p.name),
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Meeting</h1>
          <p className="text-muted-foreground mt-1">
            Create an instant meeting with participants
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Meeting Details</CardTitle>
            <CardDescription>
              Enter the meeting title and optionally add participants to invite.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Team Standup"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Participants (Optional)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
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
                        <Label htmlFor={`participant-email-${index}`}>Email</Label>
                        <Input
                          id={`participant-email-${index}`}
                          type="email"
                          placeholder="email@example.com"
                          value={participant.email}
                          onChange={(e) => updateParticipant(index, "email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`participant-name-${index}`}>Name</Label>
                        <Input
                          id={`participant-name-${index}`}
                          placeholder="Full Name"
                          value={participant.name}
                          onChange={(e) => updateParticipant(index, "name", e.target.value)}
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
                  No participants added. You can add participants to invite them to the
                  meeting.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
