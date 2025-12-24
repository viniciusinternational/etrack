/**
 * Meeting API Service
 * Handles interactions with the external meeting API
 */

interface MeetingParticipant {
  email: string;
  name: string;
}

interface CreateMeetingRequest {
  title: string;
  participants?: MeetingParticipant[];
}

interface MeetingResponse {
  id: string;
  title: string;
  status: string;
  roomName: string;
  createdAt: string;
  updatedAt: string;
  joinUrl: string;
  messageCount: number;
  participants: MeetingParticipant[];
}

interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    total?: number;
    limit?: number;
    offset?: number;
    hasMore?: boolean;
  };
}

interface ApiError {
  error: string;
  code: string;
  issues?: Record<string, unknown>;
}

/**
 * Get the meeting API base URL from environment variables
 */
function getMeetingApiBaseUrl(): string {
  const baseUrl = process.env.MEETING_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("MEETING_API_BASE_URL environment variable is not set");
  }
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

/**
 * Get the meeting API key from environment variables
 */
function getMeetingApiKey(): string {
  const apiKey = process.env.MEETING_API_KEY;
  if (!apiKey) {
    throw new Error("MEETING_API_KEY environment variable is not set");
  }
  return apiKey;
}

/**
 * Make a request to the meeting API
 */
async function meetingApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getMeetingApiBaseUrl();
  const apiKey = getMeetingApiKey();
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as ApiError;
    const errorMessage =
      errorData.error || `API request failed with status ${response.status}`;
    const errorCode = errorData.code || "API_ERROR";

    throw new Error(`${errorCode}: ${errorMessage}`);
  }

  const data = (await response.json()) as ApiResponse<T>;
  return data.data;
}

/**
 * Create a new meeting via the external API
 */
export async function createMeeting(
  title: string,
  participants?: MeetingParticipant[]
): Promise<{ id: string; joinUrl: string }> {
  try {
    const requestBody: CreateMeetingRequest = {
      title,
      participants: participants && participants.length > 0 ? participants : undefined,
    };

    const meeting = await meetingApiRequest<MeetingResponse>(
      "/api/v1/meetings",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      }
    );

    return {
      id: meeting.id,
      joinUrl: meeting.joinUrl,
    };
  } catch (error) {
    console.error("Error creating meeting via external API:", error);
    throw error;
  }
}

/**
 * Update a meeting via the external API
 */
export async function updateMeeting(
  meetingId: string,
  updates: { title?: string; status?: "ACTIVE" | "ENDED" }
): Promise<void> {
  try {
    await meetingApiRequest<MeetingResponse>(
      `/api/v1/meetings/${meetingId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updates),
      }
    );
  } catch (error) {
    console.error("Error updating meeting via external API:", error);
    throw error;
  }
}

/**
 * Delete (soft delete) a meeting via the external API
 */
export async function deleteMeeting(meetingId: string): Promise<void> {
  try {
    await meetingApiRequest<{ id: string; deleted: boolean }>(
      `/api/v1/meetings/${meetingId}`,
      {
        method: "DELETE",
      }
    );
  } catch (error) {
    console.error("Error deleting meeting via external API:", error);
    throw error;
  }
}

/**
 * Get meeting details from the external API
 */
export async function getMeeting(
  meetingId: string
): Promise<MeetingResponse> {
  try {
    return await meetingApiRequest<MeetingResponse>(
      `/api/v1/meetings/${meetingId}`
    );
  } catch (error) {
    console.error("Error fetching meeting from external API:", error);
    throw error;
  }
}

