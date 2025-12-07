import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-config";
import { ApiResponse } from "@/types";

const API_URL = "/api/permissions";

export interface Permission {
  key: string;
  module: string;
  action: string;
  description?: string;
}

export interface PermissionsGrouped {
  [module: string]: Permission[];
}

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<PermissionsGrouped>>(API_URL);
      return data.data;
    },
  });
}

export function useAllPermissions() {
  return useQuery({
    queryKey: ["permissions", "all"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<{ all: Permission[]; data: PermissionsGrouped }>>(API_URL);
      return data.data.all || [];
    },
  });
}

