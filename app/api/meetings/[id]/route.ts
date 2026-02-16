import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-permissions";
import { getMeeting, updateMeeting, deleteMeeting } from "@/lib/meeting-api";

const updateMeetingSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  status: z.enum(["ACTIVE", "ENDED"]).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: "At least one field (title or status) is required" });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request, ["view_meeting"]);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const meeting = await getMeeting(id);
    return NextResponse.json({ ok: true, data: meeting });
  } catch (error) {
    const err = error as Error;
    const message = err.message || "Failed to fetch meeting";

    if (message.includes("NOT_FOUND") || message.includes("404")) {
      return NextResponse.json({ ok: false, error: message, code: "NOT_FOUND" }, { status: 404 });
    }
    if (message.includes("MISSING_API_KEY") || message.includes("INVALID_API_KEY") || message.includes("401")) {
      return NextResponse.json({ ok: false, error: message, code: "AUTH_ERROR" }, { status: 401 });
    }

    console.error("Error fetching meeting:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch meeting", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request, ["edit_meeting"]);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateMeetingSchema.parse(body);

    const meeting = await updateMeeting(id, validatedData);
    return NextResponse.json({ ok: true, data: meeting });
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
    const message = err.message || "Failed to update meeting";

    if (message.includes("NOT_FOUND") || message.includes("404")) {
      return NextResponse.json({ ok: false, error: message, code: "NOT_FOUND" }, { status: 404 });
    }
    if (message.includes("NO_UPDATE_FIELDS")) {
      return NextResponse.json({ ok: false, error: message, code: "NO_UPDATE_FIELDS" }, { status: 400 });
    }
    if (message.includes("MISSING_API_KEY") || message.includes("INVALID_API_KEY") || message.includes("401")) {
      return NextResponse.json({ ok: false, error: message, code: "AUTH_ERROR" }, { status: 401 });
    }
    if (message.includes("VALIDATION_ERROR") || message.includes("400")) {
      return NextResponse.json({ ok: false, error: message, code: "VALIDATION_ERROR" }, { status: 400 });
    }

    console.error("Error updating meeting:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update meeting", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request, ["delete_meeting"]);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    await deleteMeeting(id);
    return NextResponse.json({ ok: true, data: { id, deleted: true } });
  } catch (error) {
    const err = error as Error;
    const message = err.message || "Failed to delete meeting";

    if (message.includes("NOT_FOUND") || message.includes("404")) {
      return NextResponse.json({ ok: false, error: message, code: "NOT_FOUND" }, { status: 404 });
    }
    if (message.includes("MISSING_API_KEY") || message.includes("INVALID_API_KEY") || message.includes("401")) {
      return NextResponse.json({ ok: false, error: message, code: "AUTH_ERROR" }, { status: 401 });
    }

    console.error("Error deleting meeting:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete meeting", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
