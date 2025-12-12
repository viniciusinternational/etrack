import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-config";
import { ApiResponse, MDA } from "@/types";

const API_URL = "/api/mdas";

export function useMDAs() {
  return useQuery({
    queryKey: ["mdas"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<MDA[]>>(API_URL);
      return data.data;
    },
  });
}

export function useMDA(id: string) {
  return useQuery({
    queryKey: ["mdas", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<MDA>>(`${API_URL}/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateMDA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: Partial<MDA>) => {
      const { data } = await axiosInstance.post<ApiResponse<MDA>>(API_URL, newItem);
      return data.data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["mdas"] });
    },
  });
}

export function useUpdateMDA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<MDA>) => {
      const { data } = await axiosInstance.put<ApiResponse<MDA>>(`${API_URL}/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mdas"] });
    },
  });
}

export function useDeleteMDA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete<ApiResponse<MDA>>(`${API_URL}/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mdas"] });
    },
  });
}
