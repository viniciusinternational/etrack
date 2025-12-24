import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { EventStatus, EventPriority, EventType } from "@prisma/client";
import { requireAuth } from "@/lib/api-permissions";
import { createMeeting } from "@/lib/meeting-api";

const participantSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(120, "Name must be 120 characters or less"),
});

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title must be 120 characters or less"),
  date: z.string().datetime(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  project: z.string().optional(),
  status: z.nativeEnum(EventStatus).optional(),
  priority: z.nativeEnum(EventPriority).optional(),
  description: z.string().optional(),
  contractor: z.string().optional(),
  eventType: z.nativeEnum(EventType).optional().default(EventType.GENERAL),
  participants: z.array(participantSchema).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['view_event']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const where: Prisma.CalendarEventWhereInput = {};
    if (date) {
      // Simple date filtering, might need range for full day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ ok: true, data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request, ['create_event']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    let meetingId: string | undefined;
    let joinUrl: string | undefined;

    // If event type is MEETING, create meeting via external API
    if (validatedData.eventType === EventType.MEETING) {
      try {
        const meetingResult = await createMeeting(
          validatedData.title,
          validatedData.participants
        );
        meetingId = meetingResult.id;
        joinUrl = meetingResult.joinUrl;
      } catch (meetingError) {
        // Log error but still create the event
        console.error("Failed to create meeting via external API:", meetingError);
        // Optionally, you could return an error here instead of continuing
        // For now, we'll create the event without meeting data
      }
    }

    const newEvent = await prisma.calendarEvent.create({
      data: {
        title: validatedData.title,
        date: new Date(validatedData.date),
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        project: validatedData.project,
        status: validatedData.status,
        priority: validatedData.priority,
        description: validatedData.description,
        contractor: validatedData.contractor,
        eventType: validatedData.eventType,
        meetingId,
        joinUrl,
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
        actionType: "CREATE",
        entityType: "CalendarEvent",
        entityId: newEvent.id,
        description: `Created event ${newEvent.title}`,
        newData: newEvent,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    return NextResponse.json({ ok: true, data: newEvent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating event:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
