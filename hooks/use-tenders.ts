import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-config";
import { ApiResponse, ProcurementRequest } from "@/types";

const API_URL = "/api/tenders";

export function useTenders() {
  return useQuery({
    queryKey: ["tenders"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<ProcurementRequest[]>>(API_URL);
      return data.data;
    },
  });
}

export function useTender(id: string) {
  return useQuery({
    queryKey: ["tenders", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<ProcurementRequest>>(`${API_URL}/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateTender() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: Partial<ProcurementRequest>) => {
      const { data } = await axiosInstance.post<ApiResponse<ProcurementRequest>>(API_URL, newItem);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
  });
}

export function useUpdateTender() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ProcurementRequest>) => {
      const { data } = await axiosInstance.put<ApiResponse<ProcurementRequest>>(`${API_URL}/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
  });
}

export function useDeleteTender() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete<ApiResponse<ProcurementRequest>>(`${API_URL}/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
  });
}
