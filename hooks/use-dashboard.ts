import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-config";
import { ApiResponse, AdminStats } from "@/types";

const API_URL = "/api/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<AdminStats>>(API_URL);
      return data.data;
    },
  });
}
