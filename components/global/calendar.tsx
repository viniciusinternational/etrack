"use client";

import { useState, useCallback, useMemo } from "react";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarEvent } from "@/types";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface GlobalCalendarProps {
  events: CalendarEvent[];
  initialDate?: Date;
  onEventClick?: (event: CalendarEvent) => void;
}

// Helper function to safely parse date
const ensureDate = (date: string | number | Date): Date => {
  if (date instanceof Date && !isNaN(date.getTime())) return date;
  if (typeof date === "string" || typeof date === "number") {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
};

export function GlobalCalendar({
  events,
  initialDate = new Date(),
  onEventClick,
}: GlobalCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [view, setView] = useState<View>("month");

  // Convert events to React Big Calendar format
  const calendarEvents = useMemo(() => {
    return events.map((event) => {
      const eventDate = ensureDate(event.date);
      return {
        ...event,
        start: eventDate,
        end: eventDate,
        resource: event,
      };
    });
  }, [events]);
  // Handle event selection
  const handleSelectEvent = useCallback(
    (event: { resource: CalendarEvent }) => {
      const originalEvent = event.resource as CalendarEvent;
      setSelectedEvent(originalEvent);
      if (onEventClick) {
        onEventClick(originalEvent);
      }
    },
    [onEventClick]
  );

  // Custom event style based on status
  const eventStyleGetter = useCallback((event: { status?: string }) => {
    const status = event.status?.toLowerCase() || "";
    let backgroundColor = "hsl(var(--primary))";

    if (status.includes("approved")) {
      backgroundColor = "#10b981"; // green
    } else if (status.includes("rejected")) {
      backgroundColor = "#ef4444"; // red
    } else if (status.includes("pending")) {
      backgroundColor = "#f59e0b"; // yellow
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  }, []);

  // Handle navigation
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  // Handle view change
  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>
            {moment(currentDate).format("MMMM YYYY")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <style jsx global>{`
            .rbc-calendar {
              font-family: inherit;
              min-height: 600px;
            }
            .rbc-header {
              padding: 10px 3px;
              font-weight: 500;
              color: hsl(var(--foreground));
              border-bottom: 1px solid hsl(var(--border));
            }
            .rbc-today {
              background-color: hsl(var(--muted));
            }
            .rbc-off-range-bg {
              background-color: hsl(var(--muted) / 0.3);
            }
            .rbc-date-cell {
              padding: 4px;
              text-align: right;
            }
            .rbc-event {
              padding: 2px 5px;
              font-size: 0.875rem;
              cursor: pointer;
            }
            .rbc-event:hover {
              opacity: 0.8;
            }
            .rbc-toolbar {
              padding: 10px 0;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
              gap: 10px;
            }
            .rbc-toolbar button {
              padding: 6px 12px;
              border: 1px solid hsl(var(--border));
              background: hsl(var(--background));
              color: hsl(var(--foreground));
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.875rem;
              transition: all 0.2s;
            }
            .rbc-toolbar button:hover {
              background: hsl(var(--muted));
            }
            .rbc-toolbar button.rbc-active {
              background: hsl(var(--primary));
              color: hsl(var(--primary-foreground));
              border-color: hsl(var(--primary));
            }
            .rbc-month-view {
              border: 1px solid hsl(var(--border));
              border-radius: 8px;
              overflow: hidden;
            }
            .rbc-day-bg {
              border-left: 1px solid hsl(var(--border));
            }
            .rbc-month-row {
              border-top: 1px solid hsl(var(--border));
            }
            .rbc-time-view {
              border: 1px solid hsl(var(--border));
              border-radius: 8px;
            }
            .rbc-time-header {
              border-bottom: 1px solid hsl(var(--border));
            }
            .rbc-time-content {
              border-top: 1px solid hsl(var(--border));
            }
            .rbc-agenda-view {
              border: 1px solid hsl(var(--border));
              border-radius: 8px;
            }
            .rbc-agenda-table {
              border: 0;
            }
            .rbc-agenda-date-cell,
            .rbc-agenda-time-cell {
              color: hsl(var(--foreground));
            }
            .rbc-agenda-event-cell {
              color: hsl(var(--foreground));
            }
          `}</style>

          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            view={view}
            onView={handleViewChange}
            date={currentDate}
            onNavigate={handleNavigate}
            views={["month", "week", "day", "agenda"]}
            popup
            tooltipAccessor={(event: {
              description?: string;
              title?: string;
            }) => (event.description || event.title || "") as string}
          />
        </CardContent>
      </Card>

      {/* Event Detail Dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {selectedEvent?.date &&
                moment(ensureDate(selectedEvent.date)).format("MMMM D, YYYY")}
            </p>
            {selectedEvent?.project && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Project</p>
                <p className="text-sm font-medium">{selectedEvent.project}</p>
              </div>
            )}
            {selectedEvent?.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm text-foreground">
                  {selectedEvent.description}
                </p>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {selectedEvent?.status && <Badge>{selectedEvent.status}</Badge>}
              {selectedEvent?.priority && (
                <Badge variant="outline">{selectedEvent.priority}</Badge>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
