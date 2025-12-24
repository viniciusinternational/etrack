import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { EventStatus, EventPriority, EventType } from "@prisma/client";
import { updateMeeting, createMeeting } from "@/lib/meeting-api";

const participantSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(120, "Name must be 120 characters or less"),
});

const updateEventSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  date: z.string().datetime().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  project: z.string().optional(),
  status: z.nativeEnum(EventStatus).optional(),
  priority: z.nativeEnum(EventPriority).optional(),
  description: z.string().optional(),
  contractor: z.string().optional(),
  eventType: z.nativeEnum(EventType).optional(),
  participants: z.array(participantSchema).optional(),
  joinUrl: z.string().url().optional(),
  meetingId: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: event });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
    });
    if (!existingEvent) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    // Handle meeting updates
    let meetingId = existingEvent.meetingId;
    let joinUrl = existingEvent.joinUrl;

    // If changing to meeting type and no meeting exists, create one
    if (validatedData.eventType === EventType.MEETING && !existingEvent.meetingId) {
      try {
        const meetingResult = await createMeeting(
          validatedData.title || existingEvent.title,
          validatedData.participants
        );
        meetingId = meetingResult.id;
        joinUrl = meetingResult.joinUrl;
      } catch (meetingError) {
        console.error("Failed to create meeting via external API:", meetingError);
        // Continue without meeting data
      }
    }
    // If updating an existing meeting
    else if (existingEvent.meetingId && validatedData.eventType === EventType.MEETING) {
      try {
        const updates: { title?: string; status?: "ACTIVE" | "ENDED" } = {};
        if (validatedData.title) {
          updates.title = validatedData.title;
        }
        // Map event status to meeting status if needed
        if (validatedData.status === "completed") {
          updates.status = "ENDED";
        }

        if (Object.keys(updates).length > 0) {
          await updateMeeting(existingEvent.meetingId, updates);
        }
      } catch (meetingError) {
        console.error("Failed to update meeting via external API:", meetingError);
        // Continue with event update
      }
    }
    // If changing from meeting to general, we keep the meetingId and joinUrl
    // but don't sync with external API (meeting remains but event is no longer a meeting)

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title: validatedData.title,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        project: validatedData.project,
        status: validatedData.status,
        priority: validatedData.priority,
        description: validatedData.description,
        contractor: validatedData.contractor,
        eventType: validatedData.eventType,
        meetingId: meetingId !== undefined ? meetingId : validatedData.meetingId,
        joinUrl: joinUrl !== undefined ? joinUrl : validatedData.joinUrl,
      },
    });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      // request.ip is optional in NextRequest types depending on version, safe access
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "UPDATE",
        entityType: "CalendarEvent",
        entityId: updatedEvent.id,
        description: `Updated event ${updatedEvent.title}`,
        previousData: existingEvent,
        newData: updatedEvent,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: updatedEvent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating event:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
    });
    if (!existingEvent) {
      return NextResponse.json(
        { ok: false, message: "Not found" },
        { status: 404 }
      );
    }

    // If event has a meetingId, delete the external meeting
    if (existingEvent.meetingId) {
      try {
        const { deleteMeeting } = await import("@/lib/meeting-api");
        await deleteMeeting(existingEvent.meetingId);
      } catch (meetingError) {
        console.error("Failed to delete meeting via external API:", meetingError);
        // Continue with event deletion even if meeting deletion fails
      }
    }

    await prisma.calendarEvent.delete({ where: { id } });

    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      // request.ip is optional in NextRequest types depending on version, safe access
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "DELETE",
        entityType: "CalendarEvent",
        entityId: id,
        description: `Deleted event ${id}`,
        previousData: existingEvent,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: { id } });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
