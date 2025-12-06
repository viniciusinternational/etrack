import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";
import { EventStatus, EventPriority } from "@prisma/client";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().datetime(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  project: z.string().optional(),
  status: z.nativeEnum(EventStatus).optional(),
  priority: z.nativeEnum(EventPriority).optional(),
  description: z.string().optional(),
  contractor: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
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
    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    const newEvent = await prisma.calendarEvent.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
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
