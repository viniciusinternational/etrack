import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-config";
import type {
  ApiResponse,
  ExternalMeeting,
  CreateMeetingInput,
  UpdateMeetingInput,
  MeetingListMeta,
} from "@/types";

const API_URL = "/api/meetings";

export interface UseMeetingsParams {
  status?: "ACTIVE" | "ENDED";
  limit?: number;
  offset?: number;
}

export interface MeetingsListResponse {
  data: ExternalMeeting[];
  meta: MeetingListMeta;
}

export function useMeetings(params: UseMeetingsParams = {}) {
  return useQuery({
    queryKey: ["meetings", params.status, params.limit, params.offset],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set("status", params.status);
      if (params.limit != null) searchParams.set("limit", String(params.limit));
      if (params.offset != null) searchParams.set("offset", String(params.offset));
      const query = searchParams.toString();
      const { data } = await axiosInstance.get<ApiResponse<ExternalMeeting[]> & { meta?: MeetingListMeta }>(
        `${API_URL}${query ? `?${query}` : ""}`
      );
      if (!data.ok || data.data === undefined) {
        throw new Error("Failed to load meetings");
      }
      return { data: data.data, meta: (data as { meta?: MeetingListMeta }).meta ?? { total: data.data.length, limit: 50, offset: 0, hasMore: false } };
    },
  });
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: ["meetings", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<ExternalMeeting>>(`${API_URL}/${id}`);
      if (!data.ok || data.data === undefined) {
        throw new Error("Failed to load meeting");
      }
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateMeetingInput) => {
      const { data } = await axiosInstance.post<ApiResponse<ExternalMeeting>>(API_URL, input);
      if (!data.ok || data.data === undefined) {
        throw new Error("Failed to create meeting");
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & UpdateMeetingInput) => {
      const { data } = await axiosInstance.patch<ApiResponse<ExternalMeeting>>(`${API_URL}/${id}`, updates);
      if (!data.ok || data.data === undefined) {
        throw new Error("Failed to update meeting");
      }
      return data.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meetings", updated.id] });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete<ApiResponse<{ id: string; deleted: boolean }>>(`${API_URL}/${id}`);
      if (!data.ok) {
        throw new Error("Failed to delete meeting");
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}
