import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse } from "@/types";

export interface BudgetAllocation {
  id: string;
  mdaId: string;
  mda?: {
    id: string;
    name: string;
    category: string;
  };
  fiscalYear: number;
  quarter?: number;
  amount: number;
  source?: string;
  category?: string;
  supportingDocs?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const API_URL = "/api/budget";

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<BudgetAllocation[]>>(
        API_URL
      );
      return data.data;
    },
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: ["budgets", id],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<BudgetAllocation>>(
        `${API_URL}/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: Partial<BudgetAllocation>) => {
      const { data } = await axios.post<ApiResponse<BudgetAllocation>>(
        API_URL,
        newItem
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<BudgetAllocation>) => {
      const { data } = await axios.put<ApiResponse<BudgetAllocation>>(
        `${API_URL}/${id}`,
        updates
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete<ApiResponse<BudgetAllocation>>(
        `${API_URL}/${id}`
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
