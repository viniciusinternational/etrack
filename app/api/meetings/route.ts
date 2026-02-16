import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-permissions";
import { listMeetings, createMeeting } from "@/lib/meeting-api";

const participantSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(120, "Name must be 120 characters or less"),
});

const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title must be 120 characters or less"),
  participants: z.array(participantSchema).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ["view_meeting"]);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as "ACTIVE" | "ENDED" | null;
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit = limitParam ? Math.min(200, Math.max(1, parseInt(limitParam, 10) || 50)) : 50;
    const offset = offsetParam ? Math.max(0, parseInt(offsetParam, 10) || 0) : 0;

    const params: { status?: "ACTIVE" | "ENDED"; limit: number; offset: number } = { limit, offset };
    if (status === "ACTIVE" || status === "ENDED") {
      params.status = status;
    }

    const result = await listMeetings(params);
    return NextResponse.json({ ok: true, data: result.data, meta: result.meta });
  } catch (error) {
    const err = error as Error;
    const message = err.message || "Failed to fetch meetings";

    if (message.includes("NOT_FOUND") || message.includes("404")) {
      return NextResponse.json({ ok: false, error: message, code: "NOT_FOUND" }, { status: 404 });
    }
    if (message.includes("MISSING_API_KEY") || message.includes("INVALID_API_KEY") || message.includes("401")) {
      return NextResponse.json({ ok: false, error: message, code: "AUTH_ERROR" }, { status: 401 });
    }
    if (message.includes("VALIDATION_ERROR") || message.includes("400")) {
      return NextResponse.json({ ok: false, error: message, code: "VALIDATION_ERROR" }, { status: 400 });
    }

    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch meetings", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ["create_meeting"]);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validatedData = createMeetingSchema.parse(body);

    const meeting = await createMeeting(
      validatedData.title,
      validatedData.participants && validatedData.participants.length > 0
        ? validatedData.participants
        : undefined
    );
    return NextResponse.json({ ok: true, data: meeting }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          issues: { fieldErrors: error.flatten().fieldErrors },
        },
        { status: 400 }
      );
    }

    const err = error as Error;
    const message = err.message || "Failed to create meeting";

    if (message.includes("MISSING_API_KEY") || message.includes("INVALID_API_KEY") || message.includes("401")) {
      return NextResponse.json({ ok: false, error: message, code: "AUTH_ERROR" }, { status: 401 });
    }
    if (message.includes("VALIDATION_ERROR") || message.includes("400")) {
      return NextResponse.json({ ok: false, error: message, code: "VALIDATION_ERROR" }, { status: 400 });
    }

    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create meeting", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
