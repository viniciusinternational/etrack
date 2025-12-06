import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse, Expenditure } from "@/types";

const API_URL = "/api/expenditure";

export function useExpenditures() {
  return useQuery({
    queryKey: ["expenditures"],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<Expenditure[]>>(API_URL);
      return data.data;
    },
  });
}

export function useExpenditure(id: string) {
  return useQuery({
    queryKey: ["expenditures", id],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<Expenditure>>(`${API_URL}/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateExpenditure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: Partial<Expenditure>) => {
      const { data } = await axios.post<ApiResponse<Expenditure>>(API_URL, newItem);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenditures"] });
    },
  });
}

export function useUpdateExpenditure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Expenditure>) => {
      const { data } = await axios.put<ApiResponse<Expenditure>>(`${API_URL}/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenditures"] });
    },
  });
}

export function useDeleteExpenditure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete<ApiResponse<Expenditure>>(`${API_URL}/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenditures"] });
    },
  });
}
