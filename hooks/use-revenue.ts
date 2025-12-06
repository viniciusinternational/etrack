import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse, Revenue } from "@/types";

const API_URL = "/api/revenue";

export function useRevenues() {
  return useQuery({
    queryKey: ["revenues"],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<Revenue[]>>(API_URL);
      return data.data;
    },
  });
}

export function useRevenue(id: string) {
  return useQuery({
    queryKey: ["revenues", id],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<Revenue>>(`${API_URL}/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateRevenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: Partial<Revenue>) => {
      const { data } = await axios.post<ApiResponse<Revenue>>(API_URL, newItem);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
    },
  });
}

export function useUpdateRevenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Revenue>) => {
      const { data } = await axios.put<ApiResponse<Revenue>>(`${API_URL}/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
    },
  });
}

export function useDeleteRevenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete<ApiResponse<Revenue>>(`${API_URL}/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
    },
  });
}
