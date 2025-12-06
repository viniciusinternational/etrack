import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse, MilestoneSubmission } from "@/types";

const API_URL = "/api/submissions";

export function useSubmissions() {
  return useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<MilestoneSubmission[]>>(API_URL);
      return data.data;
    },
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: ["submissions", id],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<MilestoneSubmission>>(`${API_URL}/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: Partial<MilestoneSubmission>) => {
      const { data } = await axios.post<ApiResponse<MilestoneSubmission>>(API_URL, newItem);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<MilestoneSubmission>) => {
      const { data } = await axios.put<ApiResponse<MilestoneSubmission>>(`${API_URL}/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useDeleteSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete<ApiResponse<MilestoneSubmission>>(`${API_URL}/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}
