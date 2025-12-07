import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-config";
import { ApiResponse, Award } from "@/types";

const API_URL = "/api/awards";

export function useAwards() {
  return useQuery({
    queryKey: ["awards"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<Award[]>>(API_URL);
      return data.data;
    },
  });
}

export function useAward(id: string) {
  return useQuery({
    queryKey: ["awards", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<Award>>(`${API_URL}/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateAward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: Partial<Award>) => {
      const { data } = await axiosInstance.post<ApiResponse<Award>>(API_URL, newItem);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
  });
}

export function useUpdateAward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Award>) => {
      const { data } = await axiosInstance.put<ApiResponse<Award>>(`${API_URL}/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
  });
}

export function useDeleteAward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete<ApiResponse<Award>>(`${API_URL}/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
  });
}
