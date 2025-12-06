"use client";

import { useState, useMemo } from "react";
import { Clock, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlobalCalendar } from "@/components/global/calendar";
import type { MilestoneSubmission, CalendarEvent } from "@/types";
import { SubmissionStatus } from "@/types";
import { useSubmissions } from "@/hooks/use-submissions";
import { getMilestoneLabel } from "./utils";

const statusConfig = {
  [SubmissionStatus.Pending]: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Circle,
  },
  [SubmissionStatus.Approved]: {
    label: "Approved",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
  [SubmissionStatus.Rejected]: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
  },
};

export function ContractorCalendarDashboard() {
  const { data: submissionsData } = useSubmissions();
  const submissions = useMemo(() => submissionsData || [], [submissionsData]);
  
  const [selectedSubmission, setSelectedSubmission] =
    useState<MilestoneSubmission | null>(null);

  // Convert submissions to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return submissions.map((submission) => {
      // Ensure date is a proper Date object
      const eventDate =
        submission.createdAt instanceof Date
          ? submission.createdAt
          : new Date(submission.createdAt);

      return {
        id: submission.id,
        title: submission.project?.title || "Untitled Project",
        date: eventDate,
        description: submission.notes || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: (statusConfig[submission.status]?.label || "planned") as any,
        priority: "medium",
        project: getMilestoneLabel(submission.milestoneStage),
      };
    });
  }, [submissions]);

  // Handle event click from calendar
  const handleEventClick = (event: CalendarEvent) => {
    const submission = submissions.find((s) => s.id === event.id);
    if (submission) {
      setSelectedSubmission(submission);
    }
  };

  // Format date safely
  const formatDate = (date: Date | string) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Milestone Submissions Calendar
          </h1>
          <p className="text-muted-foreground">
            Track your milestone submissions and their approval status
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar - Now using GlobalCalendar component with React Big Calendar */}
          <div className="lg:col-span-2">
            <GlobalCalendar
              events={calendarEvents}
              initialDate={new Date(2024, 9, 23)}
              onEventClick={handleEventClick}
            />
          </div>

          {/* Sidebar - Submission Details */}
          <div className="space-y-4">
            {selectedSubmission ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedSubmission.project?.title}
                  </CardTitle>
                  <CardDescription>
                    {getMilestoneLabel(selectedSubmission.milestoneStage)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {statusConfig[selectedSubmission.status] && (
                      <>
                        <Badge
                          className={
                            statusConfig[selectedSubmission.status].color
                          }
                        >
                          {statusConfig[selectedSubmission.status].label}
                        </Badge>
                        <Badge variant="outline">
                          {selectedSubmission.percentComplete}% Complete
                        </Badge>
                      </>
                    )}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(selectedSubmission.createdAt)}</span>
                    </div>

                    {selectedSubmission.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-foreground">
                          {selectedSubmission.notes}
                        </p>
                      </div>
                    )}

                    {selectedSubmission.reviewer && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">
                          Reviewed by
                        </p>
                        <p className="text-foreground">
                          {selectedSubmission.reviewer.name}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Link
                      href={`/contract/${selectedSubmission.projectId}/status`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        size="sm"
                      >
                        View Status
                      </Button>
                    </Link>
                    <Link
                      href={`/contract/${selectedSubmission.projectId}/submit`}
                      className="flex-1"
                    >
                      <Button className="w-full" size="sm">
                        New Submission
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>Select an event from the calendar to view details</p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/contract" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    View All Projects
                  </Button>
                </Link>
                <Link href="/contract/add" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    Submit Milestone
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {submissions
                  .sort((a, b) => {
                    const dateA =
                      a.createdAt instanceof Date
                        ? a.createdAt
                        : new Date(a.createdAt);
                    const dateB =
                      b.createdAt instanceof Date
                        ? b.createdAt
                        : new Date(b.createdAt);
                    return dateB.getTime() - dateA.getTime();
                  })
                  .slice(0, 5)
                  .map((submission) => {
                    const date =
                      submission.createdAt instanceof Date
                        ? submission.createdAt
                        : new Date(submission.createdAt);

                    return (
                      <div
                        key={submission.id}
                        onClick={() => setSelectedSubmission(submission)}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium truncate">
                            {submission.project?.title}
                          </p>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {date.toLocaleDateString("default", {
                              month: "short",
                              day: "numeric",
                            })}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getMilestoneLabel(submission.milestoneStage)}
                        </p>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
