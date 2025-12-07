import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-config";
import { ApiResponse, Bid } from "@/types";

const API_URL = "/api/bids";

export function useUpdateBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await axiosInstance.put<ApiResponse<Bid>>(`${API_URL}/${id}`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] }); // Refresh tender to see updated bids/status
      queryClient.invalidateQueries({ queryKey: ["bids"] });
    },
  });
}

export function useCreateBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newBid: Partial<Bid>) => {
      const { data } = await axiosInstance.post<ApiResponse<Bid>>(API_URL, newBid);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      queryClient.invalidateQueries({ queryKey: ["bids"] });
    },
  });
}
